-- ==============================================================
-- V5 — Cargas
--
-- Representa uma demanda de transporte publicada por uma
-- transportadora. Os campos de requisito (requer_escolta,
-- requer_rastreador, requer_aprovacao_gr) são os filtros
-- usados pelo motor de matching para selecionar motoristas.
-- ==============================================================

CREATE TYPE cargo_tipo AS ENUM (
'CARGA_GERAL',
'CARGA_FRIGORIFICADA',
'CARGA_PERIGOSA',
'CARGA_VIVA',
'GRANEL_SOLIDO',
'GRANEL_LIQUIDO',
'CARGA_INDIVISIVEL',
'VEICULOS'
);

CREATE TYPE cargo_status AS ENUM (
'AGUARDANDO',         -- publicada, aguardando matching
'MATCHING',           -- processo de matching em andamento
'OFERTA_ENVIADA',     -- oferta enviada a motoristas
'MOTORISTA_ALOCADO',  -- motorista aceitou a oferta
'EM_TRANSITO',        -- carga sendo transportada
'CONCLUIDO',          -- entrega confirmada
'CANCELADO'           -- cancelada pela transportadora
);

CREATE TABLE cargos (
    id                      UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    carrier_id              UUID          NOT NULL
        REFERENCES carrier_profiles (id) ON DELETE RESTRICT,
    vehicle_type_id         SMALLINT      NOT NULL
        REFERENCES vehicle_types (id),

-- Localização
    origem_cidade           VARCHAR(100)  NOT NULL,
    origem_estado           CHAR(2)       NOT NULL,
    origem_endereco         VARCHAR(255)  NULL,
    destino_cidade          VARCHAR(100)  NOT NULL,
    destino_estado          CHAR(2)       NOT NULL,
    destino_endereco        VARCHAR(255)  NULL,

-- Características da carga
    tipo                    cargo_tipo    NOT NULL,
    descricao               TEXT          NULL,
    peso_kg                 DECIMAL(10,2) NOT NULL,
    valor_carga             DECIMAL(15,2) NULL,     -- influencia requisitos de segurança

-- Prazos
    data_coleta_limite      TIMESTAMPTZ   NOT NULL,
    data_entrega_prevista   TIMESTAMPTZ   NULL,

-- Requisitos de segurança — critérios do motor de matching
    requer_escolta          BOOLEAN       NOT NULL DEFAULT FALSE,
    requer_rastreador       BOOLEAN       NOT NULL DEFAULT FALSE,
    requer_isca_eletronica  BOOLEAN       NOT NULL DEFAULT FALSE,
    requer_aprovacao_gr     BOOLEAN       NOT NULL DEFAULT TRUE,

-- Controle
    status                  cargo_status  NOT NULL DEFAULT 'AGUARDANDO',
    observacoes             TEXT          NULL,
    created_at              TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    deleted_at              TIMESTAMPTZ   NULL       -- soft delete: histórico preservado
);

CREATE INDEX idx_cargos_carrier_id      ON cargos (carrier_id);
CREATE INDEX idx_cargos_status          ON cargos (status)             WHERE deleted_at IS NULL;
CREATE INDEX idx_cargos_vehicle_type_id ON cargos (vehicle_type_id);
CREATE INDEX idx_cargos_data_coleta     ON cargos (data_coleta_limite) WHERE deleted_at IS NULL;

-- Dashboard: cargas ativas por transportadora ordenadas por data de criação
CREATE INDEX idx_cargos_carrier_status
ON cargos (carrier_id, status, created_at DESC)
WHERE deleted_at IS NULL;

-- Alertas de SLA: cargas com prazo de coleta próximo ainda não finalizadas
CREATE INDEX idx_cargos_coleta_limite_sla
ON cargos (data_coleta_limite, status)
WHERE status NOT IN ('CONCLUIDO', 'CANCELADO') AND deleted_at IS NULL;

COMMENT ON TABLE  cargos                        IS 'Demanda de transporte publicada por uma transportadora.';
COMMENT ON COLUMN cargos.valor_carga            IS 'Valor declarado da mercadoria — influencia requisitos de seguro e escolta.';
COMMENT ON COLUMN cargos.requer_aprovacao_gr    IS 'Quando TRUE, apenas motoristas com aprovado_gr = TRUE são elegíveis no matching.';
COMMENT ON COLUMN cargos.deleted_at             IS 'Soft delete — histórico de cargas é sempre preservado.';
