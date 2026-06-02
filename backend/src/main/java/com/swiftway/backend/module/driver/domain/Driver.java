package com.swiftway.backend.module.driver.domain;

import com.swiftway.backend.module.auth.domain.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Perfil de motorista vinculado a um {@link User} com role DRIVER.
 */
@Entity
@Table(name = "driver_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Driver {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    /** Relacionamento 1-1 com a entidade de autenticação. */
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @JdbcTypeCode(SqlTypes.CHAR)
    @Column(nullable = false, unique = true, length = 11)
    private String cpf;

    @Column(name = "nome_completo", nullable = false, length = 255)
    private String fullName;

    @Column(name = "telefone", nullable = false, length = 20)
    private String phone;

    @Column(name = "foto_url", length = 500)
    private String photoUrl;

    @Column(name = "cnh_numero", nullable = false, unique = true, length = 20)
    private String cnhNumber;

    @Column(name = "cnh_categoria", nullable = false, length = 5)
    private String cnhCategory;

    @Column(name = "cnh_validade", nullable = false)
    private LocalDate cnhValidity;

    @Column(name = "latitude", precision = 9, scale = 6)
    private BigDecimal latitude;

    @Column(name = "longitude", precision = 9, scale = 6)
    private BigDecimal longitude;

    @Column(name = "location_updated_at")
    private LocalDateTime locationUpdatedAt;

    @Builder.Default
    @Column(name = "disponivel", nullable = false)
    private boolean available = false;

    @Builder.Default
    @Column(name = "aprovado_gr", nullable = false)
    private boolean grApproved = false;

    @Builder.Default
    @Column(name = "avaliacao_media", nullable = false, precision = 3, scale = 2)
    private BigDecimal averageRating = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "total_viagens", nullable = false)
    private Integer totalTrips = 0;

    @Builder.Default
    @OneToMany(mappedBy = "driver", cascade = CascadeType.ALL, orphanRemoval = false, fetch = FetchType.LAZY)
    private List<Vehicle> vehicles = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
}
