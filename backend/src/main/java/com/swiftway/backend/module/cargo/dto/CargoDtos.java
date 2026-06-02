package com.swiftway.backend.module.cargo.dto;
import com.swiftway.backend.module.cargo.domain.enums.CargoStatus;
import com.swiftway.backend.module.cargo.domain.enums.CargoTipo;
import jakarta.validation.constraints.*;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public final class CargoDtos {

    private CargoDtos() {}

    // ── Requests ──────────────────────────────────────────────────

    public record CreateCargoRequest(

        @NotNull(message = "Tipo de veículo é obrigatório")
        Short vehicleTypeId,

        @NotBlank(message = "Cidade de origem é obrigatória")
        @Size(max = 100)
        String origemCidade,

        @NotBlank(message = "Estado de origem é obrigatório")
        @Size(min = 2, max = 2, message = "Estado deve ter 2 caracteres")
        String origemEstado,

        @Size(max = 255)
        String origemEndereco,

        @NotBlank(message = "Cidade de destino é obrigatória")
        @Size(max = 100)
        String destinoCidade,

        @NotBlank(message = "Estado de destino é obrigatório")
        @Size(min = 2, max = 2, message = "Estado deve ter 2 caracteres")
        String destinoEstado,

        @Size(max = 255)
        String destinoEndereco,

        @NotNull(message = "Tipo de carga é obrigatório")
        CargoTipo tipo,

        @Size(max = 2000)
        String descricao,

        @NotNull(message = "Peso é obrigatório")
        @Positive(message = "Peso deve ser maior que zero")
        @Digits(integer = 8, fraction = 2)
        BigDecimal pesoKg,

        @Positive(message = "Valor da carga deve ser maior que zero")
        @Digits(integer = 13, fraction = 2)
        BigDecimal valorCarga,

        @NotNull(message = "Data limite de coleta é obrigatória")
        @Future(message = "Data limite de coleta deve ser no futuro")
        LocalDateTime dataColetaLimite,

        @Future(message = "Data de entrega prevista deve ser no futuro")
        LocalDateTime dataEntregaPrevista,

        boolean requerEscolta,
        boolean requerRastreador,
        boolean requerIscaEletronica,

        boolean requerAprovacaoGr,

        @Size(max = 2000)
        String observacoes
    ) {}

    public record UpdateCargoRequest(

        @NotNull(message = "Tipo de veículo é obrigatório")
        Short vehicleTypeId,

        @NotBlank(message = "Cidade de origem é obrigatória")
        @Size(max = 100)
        String origemCidade,

        @NotBlank(message = "Estado de origem é obrigatório")
        @Size(min = 2, max = 2)
        String origemEstado,

        @Size(max = 255)
        String origemEndereco,

        @NotBlank(message = "Cidade de destino é obrigatória")
        @Size(max = 100)
        String destinoCidade,

        @NotBlank(message = "Estado de destino é obrigatório")
        @Size(min = 2, max = 2)
        String destinoEstado,

        @Size(max = 255)
        String destinoEndereco,

        @NotNull(message = "Tipo de carga é obrigatório")
        CargoTipo tipo,

        @Size(max = 2000)
        String descricao,

        @NotNull(message = "Peso é obrigatório")
        @Positive
        @Digits(integer = 8, fraction = 2)
        BigDecimal pesoKg,

        @Positive
        @Digits(integer = 13, fraction = 2)
        BigDecimal valorCarga,

        @NotNull(message = "Data limite de coleta é obrigatória")
        @Future(message = "Data limite de coleta deve ser no futuro")
        LocalDateTime dataColetaLimite,

        @Future
        LocalDateTime dataEntregaPrevista,

        boolean requerEscolta,
        boolean requerRastreador,
        boolean requerIscaEletronica,
        boolean requerAprovacaoGr,

        @Size(max = 2000)
        String observacoes
    ) {}

    public record UpdateCargoStatusRequest(
        @NotNull(message = "Status é obrigatório")
        CargoStatus status
    ) {}

    // ── Responses ─────────────────────────────────────────────────

    public record CargoResponse(
        UUID id,
        UUID carrierId,
        Short vehicleTypeId,
        String origemCidade,
        String origemEstado,
        String origemEndereco,
        String destinoCidade,
        String destinoEstado,
        String destinoEndereco,
        CargoTipo tipo,
        String descricao,
        BigDecimal pesoKg,
        BigDecimal valorCarga,
        LocalDateTime dataColetaLimite,
        LocalDateTime dataEntregaPrevista,
        boolean requerEscolta,
        boolean requerRastreador,
        boolean requerIscaEletronica,
        boolean requerAprovacaoGr,
        CargoStatus status,
        String observacoes,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
    ) {}

    public record CargoSummaryResponse(
        UUID id,
        UUID carrierId,
        String origemCidade,
        String origemEstado,
        String destinoCidade,
        String destinoEstado,
        CargoTipo tipo,
        BigDecimal pesoKg,
        CargoStatus status,
        LocalDateTime dataColetaLimite,
        LocalDateTime createdAt
    ) {}

    public record MatchResultResponse(
        UUID cargoId,
        int totalElegiveis,
        List<MatchedDriverResponse> motoristas
    ) {}

    public record MatchedDriverResponse(
        UUID driverId,
        UUID vehicleId,
        String nomeMotorista,
        BigDecimal score,
        BigDecimal distanciaKm
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
