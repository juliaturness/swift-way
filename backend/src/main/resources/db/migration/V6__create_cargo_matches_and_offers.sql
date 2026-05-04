-- ==============================================================
-- V6 — Matching e Ofertas
--
-- cargo_matches: log do algoritmo — quais motoristas foram
--   avaliados e qual score cada um recebeu.
--
-- offers: oferta formal enviada a um motorista específico,
--   com ciclo de vida próprio (aceite, recusa, expiração).
--
-- Separar as duas entidades garante rastreabilidade completa:
-- é possível saber quem foi elegível (cargo_matches) e quem
-- efetivamente respondeu (offers) de forma independente.
-- ==============================================================

CREATE TYPE offer_status AS ENUM (
'ENVIADA',    -- aguardando resposta do motorista
'ACEITA',     -- motorista aceitou
'RECUSADA',   -- motorista recusou
'EXPIRADA',   -- sem resposta dentro do prazo
'CANCELADA'   -- cancelada pela transportadora ou pelo sistema
);

-- ── LOG DE MATCHING ────────────────────────────────────────────
CREATE TABLE cargo_matches (
           id           UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
           cargo_id     UUID          NOT NULL
               REFERENCES cargos (id) ON DELETE CASCADE,
           driver_id    UUID          NOT NULL
               REFERENCES driver_profiles (id) ON DELETE CASCADE,
           vehicle_id   UUID          NOT NULL
               REFERENCES vehicles (id) ON DELETE CASCADE,
           score        DECIMAL(5,2)  NOT NULL DEFAULT 0.00, -- score calculado pelo algoritmo
           distancia_km DECIMAL(8,2)  NULL,                  -- distância no momento do match
           criado_em    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

-- Um motorista só aparece uma vez por carga no log de matching
           CONSTRAINT uq_cargo_match UNIQUE (cargo_id, driver_id)
);

CREATE INDEX idx_cargo_matches_cargo_id  ON cargo_matches (cargo_id);
CREATE INDEX idx_cargo_matches_driver_id ON cargo_matches (driver_id);
CREATE INDEX idx_cargo_matches_score     ON cargo_matches (cargo_id, score DESC);

COMMENT ON TABLE  cargo_matches              IS 'Log dos motoristas elegíveis avaliados pelo algoritmo de matching por carga.';
COMMENT ON COLUMN cargo_matches.score        IS 'Score calculado: combinação de proximidade geográfica e histórico do motorista.';
COMMENT ON COLUMN cargo_matches.distancia_km IS 'Distância em km entre o motorista e a origem da carga no momento do match.';

-- ── OFERTAS FORMAIS ────────────────────────────────────────────
CREATE TABLE offers (
    id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    cargo_id       UUID         NOT NULL
        REFERENCES cargos (id) ON DELETE CASCADE,
    driver_id      UUID         NOT NULL
        REFERENCES driver_profiles (id) ON DELETE CASCADE,
    cargo_match_id UUID         NULL
            REFERENCES cargo_matches (id) ON DELETE SET NULL,
    status         offer_status NOT NULL DEFAULT 'ENVIADA',
    motivo_recusa  VARCHAR(500) NULL,        -- preenchido pelo motorista ao recusar
    expira_em      TIMESTAMPTZ  NOT NULL,    -- prazo para aceitar ou recusar
    respondida_em  TIMESTAMPTZ  NULL,
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

-- Apenas uma oferta ativa por motorista por carga
    CONSTRAINT uq_offer_ativa UNIQUE (cargo_id, driver_id)
);

CREATE INDEX idx_offers_cargo_id  ON offers (cargo_id);
CREATE INDEX idx_offers_driver_id ON offers (driver_id);
CREATE INDEX idx_offers_status    ON offers (status);

-- Índice parcial para controle de expiração: apenas ofertas abertas
CREATE INDEX idx_offers_expira_em ON offers (expira_em)
WHERE status = 'ENVIADA';

-- Feed do motorista: ofertas pendentes ordenadas por mais recente
CREATE INDEX idx_offers_driver_pendentes
ON offers (driver_id, created_at DESC)
WHERE status = 'ENVIADA';

COMMENT ON TABLE  offers               IS 'Oferta formal de carga enviada a um motorista específico.';
COMMENT ON COLUMN offers.expira_em     IS 'Prazo limite para o motorista aceitar ou recusar. Padrão: 30 minutos após envio.';
COMMENT ON COLUMN offers.motivo_recusa IS 'Motivo opcional informado pelo motorista ao recusar a oferta.';
