package com.swiftway.backend.module.cargo.service;

import com.swiftway.backend.module.cargo.domain.entity.Cargo;
import com.swiftway.backend.module.cargo.domain.entity.CargoMatch;
import com.swiftway.backend.module.cargo.domain.entity.Offer;
import com.swiftway.backend.module.cargo.domain.enums.CargoStatus;
import com.swiftway.backend.module.cargo.domain.enums.OfferStatus;
import com.swiftway.backend.module.cargo.dto.OfferDtos.*;
import com.swiftway.backend.module.cargo.mapper.OfferMapper;
import com.swiftway.backend.module.cargo.repository.CargoMatchRepository;
import com.swiftway.backend.module.cargo.repository.CargoRepository;
import com.swiftway.backend.module.cargo.repository.OfferRepository;
import com.swiftway.backend.module.driver.domain.Driver;
import com.swiftway.backend.module.driver.repository.DriverRepository;
import com.swiftway.backend.shared.exception.BusinessConflictException;
import com.swiftway.backend.shared.exception.ForbiddenException;
import com.swiftway.backend.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class OfferService {

    @Value("${swiftway.offers.expiration-minutes:30}")
    private int defaultExpirationMinutes;

    private final CargoRepository      cargoRepository;
    private final CargoMatchRepository cargoMatchRepository;
    private final OfferRepository      offerRepository;
    private final DriverRepository     driverRepository;
    private final OfferMapper          mapper;

    // ── Create offers ────────────────────────────────────────────

    @Transactional
    public CreateOffersResponse createOffers(UUID cargoId,
                                             String carrierEmail,
                                             CreateOffersRequest req) {
        Cargo cargo = findActiveCargo(cargoId);
        assertCarrierOwns(cargo, carrierEmail);
        assertEligibleForOffers(cargo);

        int expMin = (req.expirationMinutes() != null && req.expirationMinutes() > 0)
            ? req.expirationMinutes()
            : defaultExpirationMinutes;

        OffsetDateTime expiresAt = OffsetDateTime.now().plusMinutes(expMin);

        List<CargoMatch> matches = cargoMatchRepository.findByCargoIdOrderByScoreDesc(cargoId);

        if (matches.isEmpty()) {
            throw new BusinessConflictException(
                "Nenhum match encontrado para esta carga. Execute o matching primeiro.");
        }

        Map<UUID, CargoMatch> matchByDriver = matches.stream()
            .collect(Collectors.toMap(m -> m.getDriver().getId(), m -> m));

        List<UUID> targetDriverIds = req.driverIds().isEmpty()
            ? new ArrayList<>(matchByDriver.keySet())
            : req.driverIds();

        List<Offer> created = new ArrayList<>();

        for (UUID driverId : targetDriverIds) {
            CargoMatch match = matchByDriver.get(driverId);

            if (match == null) {
                log.warn("Driver {} not in match log for cargo {} — skipping", driverId, cargoId);
                continue;
            }

            if (offerRepository.existsByCargoIdAndDriverId(cargoId, driverId)) {
                log.debug("Offer already exists for driverId={} cargoId={} — skipping", driverId, cargoId);
                continue;
            }

            Offer offer = Offer.builder()
                .cargo(cargo)
                .driver(match.getDriver())
                .cargoMatch(match)
                .status(OfferStatus.ENVIADA)
                .expiraEm(expiresAt)
                .build();

            created.add(offerRepository.save(offer));
        }

        log.info("Offers created: cargoId={} count={}", cargoId, created.size());

        List<OfferResponse> responses = created.stream()
            .map(mapper::toResponse)
            .toList();

        return new CreateOffersResponse(cargoId, created.size(), responses);
    }

    // ── List pending offers (driver feed) ────────────────────────

    @Transactional(readOnly = true)
    public PageResponse<OfferResponse> listMyOffers(String driverEmail, Pageable pageable) {
        Page<Offer> page = offerRepository.findPendingByDriverEmail(driverEmail, pageable);

        List<OfferResponse> content = page.getContent()
            .stream()
            .map(mapper::toResponse)
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

    // ── List trips (accepted offers) ─────────────────────────────

    /**
     * GET /api/v1/trips
     *
     * Returns ACEITA offers for the authenticated driver.
     * These represent active and past trips. Whether a trip is "active" or
     * "completed" is derived from cargo.status (MOTORISTA_ALOCADO/EM_TRANSITO
     * vs CONCLUIDO) on the frontend — the offer itself stays ACEITA.
     */
    @Transactional(readOnly = true)
    public PageResponse<OfferResponse> listMyTrips(String driverEmail, Pageable pageable) {
        Page<Offer> page = offerRepository.findAcceptedByDriverEmail(driverEmail, pageable);

        List<OfferResponse> content = page.getContent()
            .stream()
            .map(mapper::toResponse)
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

    // ── Accept ───────────────────────────────────────────────────

    @Transactional
    public OfferResponse accept(UUID offerId, String driverEmail) {
        Offer offer = findOfferForDriver(offerId, driverEmail);
        assertOfferIsOpen(offer);
        assertNotExpired(offer);

        offer.setStatus(OfferStatus.ACEITA);
        offer.setRespondidaEm(OffsetDateTime.now());
        offerRepository.save(offer);

        int cancelled = offerRepository.cancelOtherOffers(offer.getCargo().getId(), offerId);
        log.info("Offer accepted: offerId={} driverId={} — {} other offers cancelled",
            offerId, offer.getDriver().getId(), cancelled);

        Cargo cargo = offer.getCargo();
        cargo.setStatus(CargoStatus.MOTORISTA_ALOCADO);
        cargoRepository.save(cargo);

        return mapper.toResponse(offer);
    }

    // ── Decline ──────────────────────────────────────────────────

    @Transactional
    public OfferResponse decline(UUID offerId, String driverEmail, String motivoRecusa) {
        Offer offer = findOfferForDriver(offerId, driverEmail);
        assertOfferIsOpen(offer);

        offer.setStatus(OfferStatus.RECUSADA);
        offer.setMotivoRecusa(motivoRecusa);
        offer.setRespondidaEm(OffsetDateTime.now());
        offerRepository.save(offer);

        log.info("Offer declined: offerId={} driverId={}", offerId, offer.getDriver().getId());

        Cargo cargo = offer.getCargo();
        checkAndRevertCargo(cargo);

        return mapper.toResponse(offer);
    }

    // ── Start trip ───────────────────────────────────────────────

    /**
     * POST /api/v1/trips/{offerId}/start
     *
     * Driver marca o início da viagem (coleta realizada).
     * 1. Valida que a offer pertence ao driver autenticado e está ACEITA.
     * 2. Valida que o cargo está em MOTORISTA_ALOCADO.
     * 3. Atualiza cargo.status -> EM_TRANSITO.
     */
    @Transactional
    public OfferResponse startTrip(UUID offerId, String driverEmail) {
        Offer offer = findOfferForDriver(offerId, driverEmail);

        if (offer.getStatus() != OfferStatus.ACEITA) {
            throw new BusinessConflictException(
                "Apenas viagens aceitas podem ser iniciadas. Status atual: " + offer.getStatus());
        }

        Cargo cargo = offer.getCargo();

        if (cargo.getStatus() != CargoStatus.MOTORISTA_ALOCADO) {
            throw new BusinessConflictException(
                "Esta viagem não pode ser iniciada no status atual: " + cargo.getStatus());
        }

        cargo.setStatus(CargoStatus.EM_TRANSITO);
        cargoRepository.save(cargo);

        log.info("Trip started: offerId={} cargoId={} driverId={}",
            offerId, cargo.getId(), offer.getDriver().getId());

        return mapper.toResponse(offer);
    }

    // ── Complete trip ────────────────────────────────────────────

    /**
     * POST /api/v1/trips/{offerId}/complete
     *
     * Driver marca a entrega como concluída.
     * 1. Valida que a offer pertence ao driver autenticado e está ACEITA.
     * 2. Atualiza cargo.status -> CONCLUIDO.
     * 3. Registra o timestamp de conclusão na offer (reaproveitando respondidaEm
     *    caso ainda não esteja preenchido).
     */
    @Transactional
    public OfferResponse completeTrip(UUID offerId, String driverEmail, String fotoEntregaUrl) {
        Offer offer = findOfferForDriver(offerId, driverEmail);

        if (offer.getStatus() != OfferStatus.ACEITA)
            throw new BusinessConflictException(
                "Apenas viagens aceitas podem ser concluídas. Status atual: " + offer.getStatus());

        Cargo cargo = offer.getCargo();
        if (cargo.getStatus() == CargoStatus.CONCLUIDO)
            throw new BusinessConflictException("Esta viagem já foi concluída.");

        cargo.setStatus(CargoStatus.CONCLUIDO);
        cargoRepository.save(cargo);

        offer.setFotoEntregaUrl(fotoEntregaUrl);         // <- novo
        if (offer.getRespondidaEm() == null)
            offer.setRespondidaEm(OffsetDateTime.now());
        offerRepository.save(offer);

        log.info("Trip completed: offerId={} cargoId={} driverId={} foto={}",
            offerId, cargo.getId(), offer.getDriver().getId(), fotoEntregaUrl);

        return mapper.toResponse(offer);
    }
    // ── Helpers ───────────────────────────────────────────────────

    private void checkAndRevertCargo(Cargo cargo) {
        boolean anyOpen = cargoMatchRepository.existsOpenOfferForCargo(cargo.getId());
        if (!anyOpen && cargo.getStatus() == CargoStatus.OFERTA_ENVIADA) {
            cargo.setStatus(CargoStatus.AGUARDANDO);
            cargoRepository.save(cargo);
            log.warn("All offers declined for cargoId={} — reverted to AGUARDANDO", cargo.getId());
        }
    }

    private Cargo findActiveCargo(UUID id) {
        return cargoRepository.findActiveById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Carga não encontrada: id=" + id));
    }

    private Offer findOfferForDriver(UUID offerId, String email) {
        return offerRepository.findByIdAndDriverUserEmail(offerId, email)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Oferta não encontrada: id=" + offerId));
    }

    private void assertCarrierOwns(Cargo cargo, String email) {
        if (!cargo.getCarrier().getUser().getEmail().equalsIgnoreCase(email)) {
            throw new ForbiddenException("Sem permissão para criar ofertas nesta carga.");
        }
    }

    private void assertEligibleForOffers(Cargo cargo) {
        if (cargo.getStatus() != CargoStatus.OFERTA_ENVIADA
            && cargo.getStatus() != CargoStatus.MATCHING) {
            throw new BusinessConflictException(
                "Ofertas só podem ser criadas no status MATCHING ou OFERTA_ENVIADA. Status atual: "
                    + cargo.getStatus());
        }
    }

    private void assertOfferIsOpen(Offer offer) {
        if (offer.getStatus() != OfferStatus.ENVIADA) {
            throw new BusinessConflictException(
                "Esta oferta não está mais disponível. Status atual: " + offer.getStatus());
        }
    }

    private void assertNotExpired(Offer offer) {
        if (OffsetDateTime.now().isAfter(offer.getExpiraEm())) {
            offer.setStatus(OfferStatus.EXPIRADA);
            offerRepository.save(offer);
            throw new BusinessConflictException("Esta oferta já expirou.");
        }
    }
}