package com.swiftway.backend.module.driver.mapper;

import com.swiftway.backend.module.driver.domain.Driver;
import com.swiftway.backend.module.driver.domain.Vehicle;
import com.swiftway.backend.module.driver.dto.DriverDtos.*;
import org.springframework.stereotype.Component;

/**
 * Converte entidades do domínio de motoristas em DTOs de resposta.
 * Mantém a lógica de mapeamento centralizada e testável.
 */
@Component
public class DriverMapper {

    public DriverResponse toResponse(Driver d) {
        return new DriverResponse(
            d.getId(),
            d.getUser().getId(),
            d.getUser().getEmail(),
            d.getFullName(),
            d.getCpf(),
            d.getPhone(),
            d.getPhotoUrl(),
            d.getCnhNumber(),
            d.getCnhCategory(),
            d.getCnhValidity(),
            d.isAvailable(),
            d.isGrApproved(),
            d.getAverageRating(),
            d.getTotalTrips(),
            d.getLatitude(),
            d.getLongitude(),
            d.getLocationUpdatedAt(),
            d.getCreatedAt(),
            d.getUpdatedAt()
        );
    }

    public DriverSummaryResponse toSummary(Driver d) {
        return new DriverSummaryResponse(
            d.getId(),
            d.getUser().getId(),
            d.getFullName(),
            d.getUser().getEmail(),
            d.getPhotoUrl(),
            d.isAvailable(),
            d.getAverageRating(),
            d.getLatitude(),
            d.getLongitude()
        );
    }

    public VehicleResponse toVehicleResponse(Vehicle v) {
        return new VehicleResponse(
            v.getId(),
            v.getVehicleTypeId(),
            v.getLicensePlate(),
            v.getMake(),
            v.getModel(),
            v.getManufactureYear(),
            v.getCapacityTon(),
            v.isHasTracker(),
            v.getTrackerCompany(),
            v.isActive(),
            v.getCreatedAt()
        );
    }
}
