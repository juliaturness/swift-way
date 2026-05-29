package com.swiftway.backend.module.cargo.domain.entity;

import com.swiftway.backend.module.driver.domain.Driver;
import com.swiftway.backend.module.driver.domain.Vehicle;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "cargo_matches")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CargoMatch {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cargo_id", nullable = false)
    private Cargo cargo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id", nullable = false)
    private Driver driver;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @Column(nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal score = BigDecimal.ZERO;

    @Column(name = "distancia_km", precision = 8, scale = 2)
    private BigDecimal distanciaKm;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    @PrePersist
    void onCreate() {
        criadoEm = LocalDateTime.now();
    }
}
