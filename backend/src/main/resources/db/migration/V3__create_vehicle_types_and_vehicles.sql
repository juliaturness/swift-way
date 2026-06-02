-- ==============================================================
-- V3 — Catálogo de tipos de veículo e veículos dos motoristas
--
-- vehicle_types: catálogo de domínio separado para satisfazer
-- a 3FN — a descrição do tipo depende apenas do próprio id,
-- nunca de atributos de vehicles (ex: placa ou motorista).
--
-- vehicles: cada motorista pode cadastrar múltiplos veículos.
-- ==============================================================

-- ── CATÁLOGO DE TIPOS ──────────────────────────────────────────
CREATE TABLE vehicle_types (
                               id        SMALLSERIAL  PRIMARY KEY,
                               nome      VARCHAR(100) NOT NULL UNIQUE,
                               descricao VARCHAR(255) NULL
);

-- Dados de domínio — inseridos junto com a migration.
-- Valores estáveis; novos tipos exigem nova migration.
INSERT INTO vehicle_types (nome, descricao) VALUES
                                                ('TRUCK',      'Caminhão toco — 2 eixos'),
                                                ('BITRUCK',    'Caminhão bitruck — 3 eixos'),
                                                ('CARRETA',    'Carreta simples — 4 a 6 eixos'),
                                                ('BITREM',     'Bitrem — 7 a 9 eixos'),
                                                ('VANDERLEIA', 'Vanderleia / rodotrem — 9 eixos'),
                                                ('VAN',        'Van ou furgão leve'),
                                                ('UTILITARIO', 'Utilitário de carga');

COMMENT ON TABLE vehicle_types IS 'Catálogo de tipos de veículo aceitos na plataforma. Novos tipos via migration.';

-- ── VEÍCULOS ───────────────────────────────────────────────────
CREATE TABLE vehicles (
                          id                 UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
                          driver_id          UUID         NOT NULL
                              REFERENCES driver_profiles (id) ON DELETE CASCADE,
                          vehicle_type_id    SMALLINT     NOT NULL
                              REFERENCES vehicle_types (id),
                          placa              VARCHAR(10)  NOT NULL UNIQUE,
                          marca              VARCHAR(100) NOT NULL,
                          modelo             VARCHAR(100) NOT NULL,
                          ano_fabricacao     SMALLINT     NOT NULL,
                          capacidade_ton     DECIMAL(8,2) NOT NULL,       -- toneladas métricas
                          possui_rastreador  BOOLEAN      NOT NULL DEFAULT FALSE,
                          rastreador_empresa VARCHAR(100) NULL,            -- ex: Sascar, Onixsat, Cobli
                          ativo              BOOLEAN      NOT NULL DEFAULT TRUE,
                          created_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
                          updated_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_vehicles_driver_id       ON vehicles (driver_id);
CREATE INDEX idx_vehicles_vehicle_type_id ON vehicles (vehicle_type_id);
CREATE INDEX idx_vehicles_placa           ON vehicles (placa);
-- Índice parcial para o matching: apenas veículos ativos por tipo
CREATE INDEX idx_vehicles_tipo_ativo      ON vehicles (vehicle_type_id, driver_id)
    WHERE ativo = TRUE;

COMMENT ON TABLE  vehicles                    IS 'Veículos cadastrados por um motorista. Um motorista pode ter múltiplos veículos.';
COMMENT ON COLUMN vehicles.capacidade_ton     IS 'Capacidade máxima de carga em toneladas métricas.';
COMMENT ON COLUMN vehicles.possui_rastreador  IS 'TRUE quando o veículo possui dispositivo de rastreamento ativo e homologado.';
COMMENT ON COLUMN vehicles.rastreador_empresa IS 'Nome da empresa fornecedora do rastreador, quando houver.';
