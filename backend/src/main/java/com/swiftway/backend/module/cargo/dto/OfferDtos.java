package com.swiftway.backend.module.cargo.dto;

import com.swiftway.backend.module.cargo.domain.enums.OfferStatus;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public final class OfferDtos {

    private OfferDtos() {}

    // ── Requests ──────────────────────────────────────────────────

    /**
     * Body for POST /cargos/{id}/offers.
     * expirationMinutes: how long (in minutes) each offer stays open.
     * driverIds: optional allowlist — if empty the service uses the last match result.
     */
    public record CreateOffersRequest(
        @Size(max = 50, message = "No máximo 50 motoristas por lote")
        List<UUID> driverIds,

        Integer expirationMinutes  // null → default from property
    ) {
        public CreateOffersRequest {
            if (driverIds == null) driverIds = List.of();
        }
    }

    public record DeclineOfferRequest(
        @Size(max = 500)
        String motivoRecusa
    ) {}

    // ── Responses ─────────────────────────────────────────────────

    public record OfferResponse(
        UUID id,
        UUID cargoId,
        String origemCidade,
        String origemEstado,
        String destinoCidade,
        String destinoEstado,
        OfferStatus status,
        BigDecimal score,
        BigDecimal distanciaKm,
        OffsetDateTime expiraEm,
        OffsetDateTime respondidaEm,
        OffsetDateTime createdAt
    ) {}

    public record CreateOffersResponse(
        UUID cargoId,
        int totalEnviadas,
        List<OfferResponse> offers
    ) {}

    public record PageResponse<T>(
        List<T> content,
        int page,
        int size,
        long totalElements,
        int totalPages,
        boolean last
    ) {}
}
