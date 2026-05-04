-- ==============================================================
-- V7 — Índices de performance adicionais
--
-- Criados em migration separada para facilitar análise,
-- rollback e manutenção independente dos índices.
-- Os índices das migrations V1–V6 cobrem chaves estrangeiras
-- e unicidade. Os abaixo cobrem queries de negócio frequentes.
-- ==============================================================

-- ── MATCHING — query mais crítica do sistema ───────────────────
-- MatchingService filtra: disponivel + aprovado_gr + tipo de
-- veículo + documentos válidos + geolocalização.
-- Os dois índices abaixo cobrem as colunas mais seletivas.

-- Motoristas elegíveis para qualquer carga (sem filtro de tipo)
CREATE INDEX idx_driver_matching_base
    ON driver_profiles (disponivel, aprovado_gr, location_updated_at DESC)
    WHERE disponivel   = TRUE
      AND aprovado_gr  = TRUE
      AND deleted_at   IS NULL;

-- Documentos válidos por motorista — verificação durante matching
CREATE INDEX idx_documents_aprovados_por_driver
    ON documents (driver_id, type, validade)
    WHERE status = 'APROVADO';

-- Documentos expirando em breve — usado pelo job de alertas (30 dias)
CREATE INDEX idx_documents_expirando
    ON documents (validade, driver_id)
    WHERE status    = 'APROVADO'
      AND validade  IS NOT NULL;

-- ── VEÍCULOS — filtro por tipo no matching ─────────────────────
-- Complementa idx_vehicles_tipo_ativo (criado na V3)
-- quando o matching precisa cruzar tipo + rastreador
CREATE INDEX idx_vehicles_tipo_rastreador
    ON vehicles (vehicle_type_id, possui_rastreador, driver_id)
    WHERE ativo = TRUE;

-- ── CARGAS — queries do dashboard da transportadora ────────────

-- Cargas abertas de uma transportadora paginadas por criação
-- (complementa idx_cargos_carrier_status da V5)
CREATE INDEX idx_cargos_abertos_por_carrier
    ON cargos (carrier_id, created_at DESC)
    WHERE status    NOT IN ('CONCLUIDO', 'CANCELADO')
      AND deleted_at IS NULL;

-- ── OFERTAS — dashboard de matching da transportadora ──────────

-- Todas as ofertas de uma carga com status (visão da transportadora)
CREATE INDEX idx_offers_por_cargo_status
    ON offers (cargo_id, status, created_at DESC);

-- ── USERS — busca geral por role ───────────────────────────────
CREATE INDEX idx_users_role_active
    ON users (role, active)
    WHERE deleted_at IS NULL;
