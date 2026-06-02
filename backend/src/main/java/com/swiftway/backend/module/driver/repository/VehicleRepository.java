package com.swiftway.backend.module.driver.repository;

import com.swiftway.backend.module.driver.domain.Vehicle;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, UUID> {

    /** Lista veículos ativos de um motorista (o filtro deleted_at IS NULL já está no @SQLRestriction). */
    List<Vehicle> findByDriverId(UUID driverId);

    /** Busca veículo pelo id garantindo que pertence ao motorista. */
    Optional<Vehicle> findByIdAndDriverId(UUID id, UUID driverId);

    @Modifying
    @Query(value = "UPDATE vehicles SET ativo = false WHERE id = :id AND driver_id = :driverId", nativeQuery = true)
    void deactivateVehicle(@Param("id") UUID id, @Param("driverId") UUID driverId);

    @Query("""
    SELECT v FROM Vehicle v
    WHERE v.driver.id     = :driverId
      AND v.vehicleTypeId = :vehicleTypeId
      AND v.active        = true
    ORDER BY v.createdAt DESC
    """)
    Optional<Vehicle> findFirstActiveByDriverAndVehicleType(
        @Param("driverId")       UUID driverId,
        @Param("vehicleTypeId")  Short vehicleTypeId
    );
}
