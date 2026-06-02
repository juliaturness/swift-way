package com.swiftway.backend.module.cargo.domain.entity;
import com.swiftway.backend.module.cargo.domain.enums.OfferStatus;
import com.swiftway.backend.module.driver.domain.Driver;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "offers")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Offer {

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
    @JoinColumn(name = "cargo_match_id")
    private CargoMatch cargoMatch;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(nullable = false, columnDefinition = "offer_status")
    @Builder.Default
    private OfferStatus status = OfferStatus.ENVIADA;

    @Column(name = "motivo_recusa", length = 500)
    private String motivoRecusa;

    @Column(name = "expira_em", nullable = false)
    private OffsetDateTime expiraEm;

    @Column(name = "respondida_em")
    private OffsetDateTime  respondidaEm;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime  createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime  updatedAt;

    @PrePersist
    void onCreate() {
        createdAt = OffsetDateTime .now();
        updatedAt = OffsetDateTime .now();
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = OffsetDateTime .now();
    }
}
