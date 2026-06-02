package com.swiftway.backend.module.driver.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.SQLRestriction;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Veículos associados a um motorista
 */
@Entity
@Table(name = "vehicles")
@SQLRestriction("ativo = true")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "driver_id", nullable = false)
    private Driver driver;

    @Column(name = "vehicle_type_id", nullable = false)
    private Short vehicleTypeId;

    @Column(name = "placa", nullable = false, unique = true, length = 10)
    private String licensePlate;

    @Column(name = "marca", nullable = false, length = 100)
    private String make;

    @Column(name = "modelo", nullable = false, length = 100)
    private String model;

    @Column(name = "ano_fabricacao", nullable = false)
    private Short manufactureYear;

    @Column(name = "capacidade_ton", nullable = false, precision = 8, scale = 2)
    private BigDecimal capacityTon;

    @Builder.Default
    @Column(name = "possui_rastreador", nullable = false)
    private boolean hasTracker = false;

    @Column(name = "rastreador_empresa", length = 100)
    private String trackerCompany;

    @Builder.Default
    @Column(name = "ativo", nullable = false)
    private boolean active = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public boolean isDeleted() {
        return !active;
    }

    public void softDelete() {
        this.active = false;
    }
}
