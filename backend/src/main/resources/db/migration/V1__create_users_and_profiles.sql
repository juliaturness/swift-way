-- ==============================================================
-- V1 — Usuários e perfis de acesso
--
-- A tabela `users` centraliza autenticação (e-mail + senha).
-- Cada role tem sua própria tabela de perfil com relação 1:1,
-- satisfazendo a 3FN: atributos de cada perfil dependem apenas
-- da própria chave primária, nunca de colunas de `users`.
--
--   CARRIER → carrier_profiles
--   DRIVER  → driver_profiles
--   ADMIN   → admin_profiles
-- ==============================================================

-- ── ENUM ───────────────────────────────────────────────────────
CREATE TYPE user_role AS ENUM ('DRIVER', 'CARRIER', 'ADMIN');

-- ── TABELA BASE ────────────────────────────────────────────────
CREATE TABLE users (
                       id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
                       email      VARCHAR(255) NOT NULL UNIQUE,
                       password   VARCHAR(255) NOT NULL,          -- bcrypt hash (mínimo 12 rounds)
                       role       user_role    NOT NULL,
                       active     BOOLEAN      NOT NULL DEFAULT TRUE,
                       created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
                       updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
                       deleted_at TIMESTAMPTZ  NULL               -- soft delete
);

CREATE INDEX idx_users_email  ON users (email);
CREATE INDEX idx_users_role   ON users (role);
CREATE INDEX idx_users_active ON users (active) WHERE deleted_at IS NULL;

COMMENT ON TABLE  users            IS 'Conta de acesso unificada para todos os atores do sistema.';
COMMENT ON COLUMN users.role       IS 'Define qual tabela de perfil está vinculada: CARRIER, DRIVER ou ADMIN.';
COMMENT ON COLUMN users.deleted_at IS 'Soft delete — o registro nunca é removido fisicamente.';

-- ── PERFIL: TRANSPORTADORA (role = CARRIER) ────────────────────
CREATE TABLE carrier_profiles (
                                  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
                                  user_id       UUID         NOT NULL UNIQUE
                                      REFERENCES users (id) ON DELETE CASCADE,
                                  cnpj          CHAR(14)     NOT NULL UNIQUE,   -- somente dígitos, sem pontuação
                                  razao_social  VARCHAR(255) NOT NULL,
                                  nome_fantasia VARCHAR(255) NULL,
                                  telefone      VARCHAR(20)  NOT NULL,
                                  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
                                  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
                                  deleted_at    TIMESTAMPTZ  NULL
);

CREATE INDEX idx_carrier_profiles_user_id ON carrier_profiles (user_id);
CREATE INDEX idx_carrier_profiles_cnpj    ON carrier_profiles (cnpj);

COMMENT ON TABLE  carrier_profiles           IS 'Perfil das empresas transportadoras (role = CARRIER).';
COMMENT ON COLUMN carrier_profiles.cnpj      IS 'Somente dígitos, sem pontuação. Validado via @ValidCNPJ no backend.';
COMMENT ON COLUMN carrier_profiles.user_id   IS 'Relação 1:1 obrigatória com users.';

-- ── PERFIL: MOTORISTA (role = DRIVER) ──────────────────────────
CREATE TABLE driver_profiles (
                                 id                  UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
                                 user_id             UUID         NOT NULL UNIQUE
                                     REFERENCES users (id) ON DELETE CASCADE,
                                 cpf                 CHAR(11)     NOT NULL UNIQUE,   -- somente dígitos
                                 nome_completo       VARCHAR(255) NOT NULL,
                                 telefone            VARCHAR(20)  NOT NULL,
                                 foto_url            VARCHAR(500) NULL,

-- CNH
                                 cnh_numero          VARCHAR(20)  NOT NULL UNIQUE,
                                 cnh_categoria       VARCHAR(5)   NOT NULL,          -- A, B, C, D ou E
                                 cnh_validade        DATE         NOT NULL,

-- Geolocalização — atualizada pelo app mobile periodicamente
                                 latitude            DECIMAL(9,6) NULL,
                                 longitude           DECIMAL(9,6) NULL,
                                 location_updated_at TIMESTAMPTZ  NULL,

-- Status operacional
                                 disponivel          BOOLEAN      NOT NULL DEFAULT FALSE,
                                 aprovado_gr         BOOLEAN      NOT NULL DEFAULT FALSE,  -- gerenciadora de risco

-- Histórico de performance
                                 avaliacao_media     DECIMAL(3,2) NOT NULL DEFAULT 0.00,   -- 0.00 a 5.00
                                 total_viagens       INTEGER      NOT NULL DEFAULT 0,

                                 created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
                                 updated_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
                                 deleted_at          TIMESTAMPTZ  NULL
);

CREATE INDEX idx_driver_profiles_user_id    ON driver_profiles (user_id);
CREATE INDEX idx_driver_profiles_cpf        ON driver_profiles (cpf);
CREATE INDEX idx_driver_profiles_disponivel ON driver_profiles (disponivel)
    WHERE deleted_at IS NULL;
CREATE INDEX idx_driver_profiles_location   ON driver_profiles (latitude, longitude)
    WHERE disponivel = TRUE AND deleted_at IS NULL;
-- Índice composto usado pelo MatchingService no filtro principal
CREATE INDEX idx_driver_profiles_matching   ON driver_profiles (disponivel, aprovado_gr)
    WHERE disponivel = TRUE AND aprovado_gr = TRUE AND deleted_at IS NULL;

COMMENT ON TABLE  driver_profiles                IS 'Perfil dos motoristas autônomos (role = DRIVER).';
COMMENT ON COLUMN driver_profiles.disponivel     IS 'Motorista sinaliza disponibilidade pelo app. Critério central do matching.';
COMMENT ON COLUMN driver_profiles.aprovado_gr    IS 'TRUE quando pré-aprovado pela gerenciadora de risco parceira.';
COMMENT ON COLUMN driver_profiles.avaliacao_media IS 'Média das avaliações recebidas após viagens concluídas (0.00–5.00).';

-- ── PERFIL: ADMINISTRADOR (role = ADMIN) ───────────────────────
CREATE TABLE admin_profiles (
                                id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
                                user_id       UUID         NOT NULL UNIQUE
                                    REFERENCES users (id) ON DELETE CASCADE,
                                nome_completo VARCHAR(255) NOT NULL,
                                departamento  VARCHAR(100) NULL,            -- ex: Operações, TI, Jurídico
                                superadmin    BOOLEAN      NOT NULL DEFAULT FALSE,
                                created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
                                updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
-- Sem deleted_at: inativação via users.active = FALSE
);

CREATE INDEX idx_admin_profiles_user_id ON admin_profiles (user_id);

COMMENT ON TABLE  admin_profiles              IS 'Perfil dos administradores da plataforma (role = ADMIN).';
COMMENT ON COLUMN admin_profiles.superadmin   IS 'TRUE = acesso total, incluindo gestão de outros admins e configurações globais.';
COMMENT ON COLUMN admin_profiles.departamento IS 'Utilizado para auditoria de ações administrativas.';
