package com.swiftway.backend.module.document.service;

import com.swiftway.backend.module.document.domain.Document;
import com.swiftway.backend.module.document.domain.DocumentStatus;
import com.swiftway.backend.module.document.dto.DocumentDtos.*;
import com.swiftway.backend.module.document.mapper.DocumentMapper;
import com.swiftway.backend.module.document.repository.DocumentRepository;
import com.swiftway.backend.module.driver.domain.Driver;
import com.swiftway.backend.module.driver.domain.Vehicle;
import com.swiftway.backend.module.driver.repository.DriverRepository;
import com.swiftway.backend.module.driver.repository.VehicleRepository;
import com.swiftway.backend.shared.exception.BusinessConflictException;
import com.swiftway.backend.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class DocumentService {

    private static final int DIAS_AVISO_VENCIMENTO = 30;

    private final DocumentRepository documentRepository;
    private final DriverRepository   driverRepository;
    private final VehicleRepository  vehicleRepository;
    private final DocumentMapper     mapper;
    private final StorageService     storageService;

    // ── Upload ────────────────────────────────────────────────────

    @Transactional
    public DocumentResponse upload(String email, MultipartFile file, UploadDocumentRequest req) {
        Driver driver = findDriverByEmail(email);

        // Constraint: apenas 1 ativo (PENDENTE ou APROVADO) por tipo por motorista
        if (documentRepository.existsAtivoByDriverIdAndType(driver.getId(), req.type())) {
            throw new BusinessConflictException(
                "Já existe um documento do tipo " + req.type() + " ativo. " +
                    "Aguarde a rejeição ou expiração antes de reenviar.");
        }

        Vehicle vehicle = null;
        if (req.vehicleId() != null) {
            vehicle = vehicleRepository.findByIdAndDriverId(req.vehicleId(), driver.getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                    "Veículo não encontrado: id=" + req.vehicleId()));
        }

        String url = storageService.upload(file, "documents/" + driver.getId());

        Document doc = Document.builder()
            .driver(driver)
            .vehicle(vehicle)
            .type(req.type())
            .arquivoUrl(url)
            .arquivoNome(file.getOriginalFilename())
            .validade(req.validade())
            .build();

        Document saved = documentRepository.save(doc);
        log.info("Document uploaded: docId={} type={} driverId={}", saved.getId(), req.type(), driver.getId());
        return mapper.toResponse(saved);
    }

    // ── Listagem ──────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<DocumentResponse> listMyDocuments(String email) {
        Driver driver = findDriverByEmail(email);
        return documentRepository.findByDriverId(driver.getId())
            .stream()
            .map(mapper::toResponse)
            .toList();
    }

    // ── Validação (admin) ─────────────────────────────────────────

    @Transactional
    public DocumentResponse validate(UUID driverId, UUID docId, UUID adminId,
                                     ValidateDocumentRequest req) {

        if (req.status() == DocumentStatus.REJEITADO
            && (req.motivoRejeicao() == null || req.motivoRejeicao().isBlank())) {
            throw new BusinessConflictException("Motivo de rejeição é obrigatório ao rejeitar.");
        }

        if (req.status() != DocumentStatus.APROVADO && req.status() != DocumentStatus.REJEITADO) {
            throw new BusinessConflictException(
                "Status inválido para validação. Use APROVADO ou REJEITADO.");
        }

        Document doc = documentRepository.findByIdAndDriverId(docId, driverId)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Documento não encontrado: id=" + docId));

        if (doc.getStatus() != DocumentStatus.PENDENTE) {
            throw new BusinessConflictException(
                "Apenas documentos PENDENTE podem ser validados. Status atual: " + doc.getStatus());
        }

        doc.setStatus(req.status());
        doc.setMotivoRejeicao(req.motivoRejeicao());
        doc.setValidatedBy(adminId);
        doc.setValidatedAt(LocalDateTime.now());

        Document saved = documentRepository.save(doc);
        log.info("Document validated: docId={} status={} by adminId={}", docId, req.status(), adminId);
        return mapper.toResponse(saved);
    }

    // ── Jobs agendados ────────────────────────────────────────────

    /**
     * Roda toda madrugada às 02:00 — marca como EXPIRADO documentos vencidos.
     */
    @Scheduled(cron = "0 0 2 * * *")
    @Transactional
    public void expirarDocumentosVencidos() {
        int total = documentRepository.expireVencidos(LocalDate.now());
        log.info("Document expiration job: {} documents marked as EXPIRADO", total);
    }

    /**
     * Roda todo dia às 08:00 — notifica motoristas com documentos vencendo em 30 dias.
     */
    @Scheduled(cron = "0 0 8 * * *")
    @Transactional(readOnly = true)
    public void notificarProximosDoVencimento() {
        LocalDate hoje   = LocalDate.now();
        LocalDate limite = hoje.plusDays(DIAS_AVISO_VENCIMENTO);

        List<Document> proximos = documentRepository.findProximosDoVencimento(hoje, limite);

        proximos.forEach(doc -> {
            // TODO: integrar com serviço de notificação (email, push, webhook)
            // Por ora loga — substituir pela chamada real ao NotificationService
            log.warn("Document expiring soon: docId={} type={} driverId={} validade={}",
                doc.getId(), doc.getType(), doc.getDriver().getId(), doc.getValidade());
        });

        log.info("Notification job: {} documents expiring within {} days",
            proximos.size(), DIAS_AVISO_VENCIMENTO);
    }

    // ── helpers ───────────────────────────────────────────────────

    private Driver findDriverByEmail(String email) {
        return driverRepository.findByUserEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Perfil de motorista não encontrado para: " + email));
    }
}
