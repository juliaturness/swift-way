package com.swiftway.backend.module.cargo.domain.entity;

import com.swiftway.backend.module.cargo.domain.enums.CargoStatus;
import com.swiftway.backend.module.cargo.domain.enums.CargoTipo;
import com.swiftway.backend.module.carrier.domain.Carrier;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "cargos")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Cargo {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "carrier_id", nullable = false)
    private Carrier carrier;

    @Column(name = "vehicle_type_id", nullable = false)
    private Short vehicleTypeId;

    // ── Localização ───────────────────────────────────────────────

    @Column(name = "origem_cidade", nullable = false, length = 100)
    private String origemCidade;

    @Column(name = "origem_estado", nullable = false, columnDefinition = "bpchar(2)")
    private String origemEstado;

    @Column(name = "origem_endereco")
    private String origemEndereco;

    @Column(name = "destino_cidade", nullable = false, length = 100)
    private String destinoCidade;

    @Column(name = "destino_estado", nullable = false, columnDefinition = "bpchar(2)")
    private String destinoEstado;

    @Column(name = "destino_endereco")
    private String destinoEndereco;

    // ── Características ───────────────────────────────────────────

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(nullable = false, columnDefinition = "cargo_tipo")
    private CargoTipo tipo;

    @Column(columnDefinition = "TEXT")
    private String descricao;

    @Column(name = "peso_kg", nullable = false, precision = 10, scale = 2)
    private BigDecimal pesoKg;

    @Column(name = "valor_carga", precision = 15, scale = 2)
    private BigDecimal valorCarga;

    // ── Prazos ────────────────────────────────────────────────────

    @Column(name = "data_coleta_limite", nullable = false)
    private LocalDateTime dataColetaLimite;

    @Column(name = "data_entrega_prevista")
    private LocalDateTime dataEntregaPrevista;

    // ── Requisitos de segurança ───────────────────────────────────

    @Column(name = "requer_escolta", nullable = false)
    @Builder.Default
    private boolean requerEscolta = false;

    @Column(name = "requer_rastreador", nullable = false)
    @Builder.Default
    private boolean requerRastreador = false;

    @Column(name = "requer_isca_eletronica", nullable = false)
    @Builder.Default
    private boolean requerIscaEletronica = false;

    @Column(name = "requer_aprovacao_gr", nullable = false)
    @Builder.Default
    private boolean requerAprovacaoGr = true;

    // ── Controle ──────────────────────────────────────────────────

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(nullable = false, columnDefinition = "cargo_status")
    @Builder.Default
    private CargoStatus status = CargoStatus.AGUARDANDO;

    @Column(columnDefinition = "TEXT")
    private String observacoes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @PrePersist
    void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
