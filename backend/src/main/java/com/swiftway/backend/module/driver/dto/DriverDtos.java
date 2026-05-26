package com.swiftway.backend.module.driver.dto;

import com.swiftway.backend.shared.validation.ValidCPF;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
public final class DriverDtos {

    private DriverDtos() {}

    public record UpdateDriverRequest(

        @NotBlank(message = "Nome completo é obrigatório")
        @Size(max = 255)
        String fullName,

        @ValidCPF
        @NotBlank(message = "CPF é obrigatório")
        String cpf,

        @Size(max = 20)
        String phone,

        @Size(max = 20, message = "Número da CNH deve ter no máximo 20 caracteres")
        String cnhNumber,

        @Size(max = 5, message = "Categoria da CNH deve ter no máximo 5 caracteres")
        String cnhCategory,

        LocalDate cnhValidity
    ) {}

    public record UpdateAvailabilityRequest(
        @NotNull(message = "Campo 'available' é obrigatório")
        Boolean available
    ) {}

    public record UpdateLocationRequest(
        @NotNull(message = "Latitude é obrigatória")
        @DecimalMin(value = "-90.0", message = "Latitude mínima: -90")
        @DecimalMax(value =  "90.0", message = "Latitude máxima: 90")
        BigDecimal latitude,

        @NotNull(message = "Longitude é obrigatória")
        @DecimalMin(value = "-180.0", message = "Longitude mínima: -180")
        @DecimalMax(value =  "180.0", message = "Longitude máxima: 180")
        BigDecimal longitude
    ) {}

    public record CreateVehicleRequest(
        @NotNull(message = "O ID do tipo de veículo é obrigatório")
        Short vehicleTypeId,

        @NotBlank(message = "Placa é obrigatória")
        @Pattern(
            regexp = "^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$|^[A-Z]{3}-?[0-9]{4}$",
            message = "Placa inválida. Use o formato Mercosul (ABC1D23) ou antigo (ABC-1234)"
        )
        @Size(max = 10)
        String licensePlate,

        @NotBlank(message = "Marca é obrigatória")
        @Size(max = 100)
        String make,

        @NotBlank(message = "Modelo é obrigatório")
        @Size(max = 100)
        String model,

        @NotNull(message = "Ano de fabricação é obrigatório")
        @Min(value = 1950, message = "Ano de fabricação inválido")
        @Max(value = 2100, message = "Ano de fabricação inválido")
        Short manufactureYear,

        @NotNull(message = "Capacidade em toneladas é obrigatória")
        @Positive(message = "A capacidade deve ser maior que zero")
        @Digits(integer = 6, fraction = 2, message = "Formato de capacidade inválido")
        BigDecimal capacityTon,

        @NotNull(message = "Informe se o veículo possui rastreador")
        Boolean hasTracker,

        @Size(max = 100)
        String trackerCompany
    ) {}

    public record DriverResponse(
        UUID id,
        UUID userId,
        String email,
        String fullName,
        String cpf,
        String phone,
        String photoUrl,
        String cnhNumber,
        String cnhCategory,
        LocalDate cnhValidity,
        boolean available,
        boolean grApproved,
        BigDecimal averageRating,
        Integer totalTrips,
        BigDecimal latitude,
        BigDecimal longitude,
        LocalDateTime locationUpdatedAt,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
    ) {}

    public record DriverSummaryResponse(
        UUID id,
        UUID userId,
        String fullName,
        String email,
        String photoUrl,
        boolean available,
        BigDecimal averageRating,
        BigDecimal latitude,
        BigDecimal longitude
    ) {}

    public record AvailabilityResponse(
        UUID driverId,
        boolean available
    ) {}

    public record LocationResponse(
        UUID driverId,
        BigDecimal latitude,
        BigDecimal longitude
    ) {}

    public record VehicleResponse(
        UUID id,
        Short vehicleTypeId,
        String licensePlate,
        String make,
        String model,
        Short manufactureYear,
        BigDecimal capacityTon,
        boolean hasTracker,
        String trackerCompany,
        boolean active,
        LocalDateTime createdAt
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
