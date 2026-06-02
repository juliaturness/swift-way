package com.swiftway.backend.module.cargo.service;

import com.swiftway.backend.module.cargo.domain.entity.Cargo;
import com.swiftway.backend.module.cargo.domain.entity.CargoMatch;
import com.swiftway.backend.module.cargo.domain.enums.CargoStatus;
import com.swiftway.backend.module.cargo.domain.enums.CargoTipo;
import com.swiftway.backend.module.cargo.dto.CargoDtos.*;
import com.swiftway.backend.module.cargo.mapper.CargoMapper;
import com.swiftway.backend.module.cargo.repository.CargoMatchRepository;
import com.swiftway.backend.module.cargo.repository.CargoRepository;
import com.swiftway.backend.module.carrier.domain.Carrier;
import com.swiftway.backend.module.carrier.repository.CarrierRepository;
import com.swiftway.backend.shared.exception.BusinessConflictException;
import com.swiftway.backend.shared.exception.ForbiddenException;
import com.swiftway.backend.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CargoService {

    private final CargoRepository      cargoRepository;
    private final CarrierRepository    carrierRepository;
    private final CargoMatchRepository cargoMatchRepository;
    private final CargoMapper          mapper;
    private final MatchingService      matchingService;

    // ── CRUD ──────────────────────────────────────────────────────

    @Transactional
    public CargoResponse create(String carrierEmail, CreateCargoRequest req) {
        Carrier carrier = findCarrierByEmail(carrierEmail);

        Cargo cargo = Cargo.builder()
            .carrier(carrier)
            .vehicleTypeId(req.vehicleTypeId())
            .origemCidade(req.origemCidade())
            .origemEstado(req.origemEstado().toUpperCase())
            .origemEndereco(req.origemEndereco())
            .destinoCidade(req.destinoCidade())
            .destinoEstado(req.destinoEstado().toUpperCase())
            .destinoEndereco(req.destinoEndereco())
            .tipo(req.tipo())
            .descricao(req.descricao())
            .pesoKg(req.pesoKg())
            .valorCarga(req.valorCarga())
            .dataColetaLimite(req.dataColetaLimite())
            .dataEntregaPrevista(req.dataEntregaPrevista())
            .requerEscolta(req.requerEscolta())
            .requerRastreador(req.requerRastreador())
            .requerIscaEletronica(req.requerIscaEletronica())
            .requerAprovacaoGr(req.requerAprovacaoGr())
            .observacoes(req.observacoes())
            .build();

        Cargo saved = cargoRepository.save(cargo);
        log.info("Cargo created: cargoId={} carrierId={}", saved.getId(), carrier.getId());
        return mapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public PageResponse<CargoSummaryResponse> list(
        CargoStatus status,
        CargoTipo tipo,
        String origem,
        LocalDateTime dataInicio,
        LocalDateTime dataFim,
        Pageable pageable) {

        // 1. Inicia a query exigindo que deletedAt seja nulo (sua regra de soft delete)
        Specification<Cargo> spec = Specification.where((root, query, cb) ->
            cb.isNull(root.get("deletedAt"))
        );

        // 2. Acopla os filtros apenas se vieram na requisição
        if (status != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), status));
        }

        if (tipo != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("tipo"), tipo));
        }

        if (origem != null && !origem.isBlank()) {
            spec = spec.and((root, query, cb) ->
                cb.like(cb.lower(root.get("origemCidade")), "%" + origem.toLowerCase() + "%")
            );
        }

        if (dataInicio != null) {
            spec = spec.and((root, query, cb) ->
                cb.greaterThanOrEqualTo(root.get("dataColetaLimite"), dataInicio)
            );
        }

        if (dataFim != null) {
            spec = spec.and((root, query, cb) ->
                cb.lessThanOrEqualTo(root.get("dataColetaLimite"), dataFim)
            );
        }

        // 3. Executa a busca passando a Specification no lugar da Query antiga
        Page<Cargo> page = cargoRepository.findAll(spec, pageable);

        // 4. Mapeamento mantido exatamente como o seu original!
        List<CargoSummaryResponse> content = page.getContent()
            .stream()
            .map(mapper::toSummary)
            .toList();

        return new PageResponse<>(
            content,
            page.getNumber(),
            page.getSize(),
            page.getTotalElements(),
            page.getTotalPages(),
            page.isLast()
        );
    }

    @Transactional(readOnly = true)
    public CargoResponse getById(UUID id) {
        return mapper.toResponse(findActiveById(id));
    }

    @Transactional
    public CargoResponse update(UUID id, String carrierEmail, UpdateCargoRequest req) {
        Cargo cargo = findActiveById(id);
        assertCarrierOwns(cargo, carrierEmail);
        assertEditavel(cargo);

        cargo.setVehicleTypeId(req.vehicleTypeId());
        cargo.setOrigemCidade(req.origemCidade());
        cargo.setOrigemEstado(req.origemEstado().toUpperCase());
        cargo.setOrigemEndereco(req.origemEndereco());
        cargo.setDestinoCidade(req.destinoCidade());
        cargo.setDestinoEstado(req.destinoEstado().toUpperCase());
        cargo.setDestinoEndereco(req.destinoEndereco());
        cargo.setTipo(req.tipo());
        cargo.setDescricao(req.descricao());
        cargo.setPesoKg(req.pesoKg());
        cargo.setValorCarga(req.valorCarga());
        cargo.setDataColetaLimite(req.dataColetaLimite());
        cargo.setDataEntregaPrevista(req.dataEntregaPrevista());
        cargo.setRequerEscolta(req.requerEscolta());
        cargo.setRequerRastreador(req.requerRastreador());
        cargo.setRequerIscaEletronica(req.requerIscaEletronica());
        cargo.setRequerAprovacaoGr(req.requerAprovacaoGr());
        cargo.setObservacoes(req.observacoes());

        Cargo saved = cargoRepository.save(cargo);
        log.info("Cargo updated: cargoId={}", id);
        return mapper.toResponse(saved);
    }

    @Transactional
    public void delete(UUID id, String carrierEmail) {
        Cargo cargo = findActiveById(id);
        assertCarrierOwns(cargo, carrierEmail);
        assertEditavel(cargo);

        cargo.setDeletedAt(LocalDateTime.now());
        cargoRepository.save(cargo);
        log.info("Cargo soft-deleted: cargoId={}", id);
    }

    @Transactional
    public CargoResponse updateStatus(UUID id, String carrierEmail, UpdateCargoStatusRequest req) {
        Cargo cargo = findActiveById(id);
        assertCarrierOwns(cargo, carrierEmail);

        cargo.setStatus(req.status());
        Cargo saved = cargoRepository.save(cargo);
        log.info("Cargo status updated: cargoId={} status={}", id, req.status());
        return mapper.toResponse(saved);
    }

    // ── Matching ──────────────────────────────────────────────────

    @Transactional
    public MatchResultResponse triggerMatching(UUID cargoId, String carrierEmail) {
        Cargo cargo = findActiveById(cargoId);
        assertCarrierOwns(cargo, carrierEmail);

        if (cargo.getStatus() != CargoStatus.AGUARDANDO) {
            throw new BusinessConflictException(
                "Matching só pode ser acionado em cargas com status AGUARDANDO. Status atual: "
                    + cargo.getStatus());
        }

        cargo.setStatus(CargoStatus.MATCHING);
        cargoRepository.save(cargo);

        List<CargoMatch> matches =
            matchingService.findEligibleDrivers(cargo);

        List<MatchedDriverResponse> motoristas = matches.stream()
            .map(mapper::toMatchedDriver)
            .toList();

        if (!matches.isEmpty()) {
            cargo.setStatus(CargoStatus.OFERTA_ENVIADA);
        } else {
            cargo.setStatus(CargoStatus.AGUARDANDO);
            log.warn("Nenhum motorista elegível para cargoId={} — revertendo para AGUARDANDO", cargoId);
        }
        cargoRepository.save(cargo);
        return new MatchResultResponse(cargoId, matches.size(), motoristas);
    }

    // ── helpers ───────────────────────────────────────────────────

    private Cargo findActiveById(UUID id) {
        return cargoRepository.findActiveById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Carga não encontrada: id=" + id));
    }

    private Carrier findCarrierByEmail(String email) {
        return carrierRepository.findByUserEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Perfil de transportadora não encontrado para: " + email));
    }

    private void assertCarrierOwns(Cargo cargo, String requesterEmail) {
        if (!cargo.getCarrier().getUser().getEmail().equalsIgnoreCase(requesterEmail)) {
            throw new ForbiddenException("Sem permissão para alterar esta carga.");
        }
    }

    private void assertEditavel(Cargo cargo) {
        if (cargo.getStatus() != CargoStatus.AGUARDANDO) {
            throw new BusinessConflictException(
                "Carga não pode ser editada no status: " + cargo.getStatus());
        }
    }
}
