-- ==============================================================
-- R__seed_dev_data.sql — Dados de desenvolvimento
--
-- Prefixo R__ = Repeatable migration do Flyway.
-- Re-executada automaticamente sempre que o checksum mudar.
--
-- NUNCA incluir em produção.
-- Configurar no application-dev.yml:
--   spring.flyway.locations:
--     - classpath:db/migration
--     - classpath:db/seed
--
-- Senha de todos os usuários: Test@1234
-- Hash bcrypt 12 rounds gerado offline.
--
-- Cenários cobertos:
--   MOTORISTAS
--     carlos.silva   → disponível + aprovado_gr + docs OK   → ELEGÍVEL no matching
--     marcos.souza   → disponível + aprovado_gr + CRLV pendente → ELEGÍVEL (mas doc incompleto)
--     jose.pereira   → indisponível (em viagem)              → NÃO aparece no matching
--     ana.rodrigues  → disponível + NÃO aprovado_gr          → FILTRADO pelo critério GR
--     pedro.alves    → disponível + aprovado_gr + CNH vencida → FILTRADO por doc expirado
--
--   TRANSPORTADORAS
--     rapidacargo    → com 3 cargas em estados diferentes
--     sulfretes      → com 1 carga cancelada (histórico)
--
--   ADMINS
--     admin@         → superadmin
--     operacoes@     → admin de operações (sem superadmin)
-- ==============================================================

-- ── LIMPEZA (ordem inversa das FKs) ────────────────────────────
TRUNCATE TABLE offers           CASCADE;
TRUNCATE TABLE cargo_matches    CASCADE;
TRUNCATE TABLE cargos           CASCADE;
TRUNCATE TABLE documents        CASCADE;
TRUNCATE TABLE vehicles         CASCADE;
TRUNCATE TABLE driver_profiles  CASCADE;
TRUNCATE TABLE addresses        CASCADE;
TRUNCATE TABLE carrier_profiles CASCADE;
TRUNCATE TABLE admin_profiles   CASCADE;
TRUNCATE TABLE users            CASCADE;

-- ==============================================================
-- BLOCO 1 — USERS
-- ==============================================================

INSERT INTO users (id, email, password, role, active) VALUES

                                                          -- Transportadoras
                                                          ('a1000000-0000-0000-0000-000000000001',
                                                           'logistica@rapidacargo.com.br',
                                                           '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMUdfufEX6cGBJ1wR3tB9FZTQ2',
                                                           'CARRIER', TRUE),

                                                          ('a1000000-0000-0000-0000-000000000002',
                                                           'operacoes@sulfretes.com.br',
                                                           '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMUdfufEX6cGBJ1wR3tB9FZTQ2',
                                                           'CARRIER', TRUE),

                                                          -- Motoristas
                                                          ('a2000000-0000-0000-0000-000000000001',
                                                           'carlos.silva@email.com',
                                                           '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMUdfufEX6cGBJ1wR3tB9FZTQ2',
                                                           'DRIVER', TRUE),

                                                          ('a2000000-0000-0000-0000-000000000002',
                                                           'marcos.souza@email.com',
                                                           '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMUdfufEX6cGBJ1wR3tB9FZTQ2',
                                                           'DRIVER', TRUE),

                                                          ('a2000000-0000-0000-0000-000000000003',
                                                           'jose.pereira@email.com',
                                                           '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMUdfufEX6cGBJ1wR3tB9FZTQ2',
                                                           'DRIVER', TRUE),

                                                          ('a2000000-0000-0000-0000-000000000004',
                                                           'ana.rodrigues@email.com',
                                                           '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMUdfufEX6cGBJ1wR3tB9FZTQ2',
                                                           'DRIVER', TRUE),

                                                          ('a2000000-0000-0000-0000-000000000005',
                                                           'pedro.alves@email.com',
                                                           '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMUdfufEX6cGBJ1wR3tB9FZTQ2',
                                                           'DRIVER', TRUE),

                                                          -- Admins
                                                          ('a3000000-0000-0000-0000-000000000001',
                                                           'admin@vaptuvupt.com.br',
                                                           '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMUdfufEX6cGBJ1wR3tB9FZTQ2',
                                                           'ADMIN', TRUE),

                                                          ('a3000000-0000-0000-0000-000000000002',
                                                           'operacoes@vaptuvupt.com.br',
                                                           '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMUdfufEX6cGBJ1wR3tB9FZTQ2',
                                                           'ADMIN', TRUE);

-- ==============================================================
-- BLOCO 2 — ADMIN PROFILES
-- (antes dos carrier_profiles pois documents.validated_by
--  referencia admin_profiles)
-- ==============================================================

INSERT INTO admin_profiles (id, user_id, nome_completo, departamento, superadmin) VALUES

                                                                                      ('b3000000-0000-0000-0000-000000000001',
                                                                                       'a3000000-0000-0000-0000-000000000001',
                                                                                       'Administrador Sistema', 'TI', TRUE),

                                                                                      ('b3000000-0000-0000-0000-000000000002',
                                                                                       'a3000000-0000-0000-0000-000000000002',
                                                                                       'Ana Beatriz Costa', 'Operações', FALSE);

-- ==============================================================
-- BLOCO 3 — CARRIER PROFILES
-- ==============================================================

INSERT INTO carrier_profiles (id, user_id, cnpj, razao_social, nome_fantasia, telefone) VALUES

                                                                                            ('b1000000-0000-0000-0000-000000000001',
                                                                                             'a1000000-0000-0000-0000-000000000001',
                                                                                             '12345678000195',
                                                                                             'Rápida Cargo Transportes Ltda',
                                                                                             'Rápida Cargo',
                                                                                             '48991110001'),

                                                                                            ('b1000000-0000-0000-0000-000000000002',
                                                                                             'a1000000-0000-0000-0000-000000000002',
                                                                                             '98765432000188',
                                                                                             'Sul Fretes Transportadora S.A.',
                                                                                             'Sul Fretes',
                                                                                             '48991110002');

-- ==============================================================
-- BLOCO 4 — ADDRESSES
-- ==============================================================

INSERT INTO addresses
(carrier_id, type, logradouro, numero, complemento, bairro, cidade, estado, cep)
VALUES
    -- Rápida Cargo: sede em São José
    ('b1000000-0000-0000-0000-000000000001',
     'SEDE', 'Rua das Palmeiras', '1500', NULL,
     'Kobrasol', 'São José', 'SC', '88102000'),

    -- Rápida Cargo: ponto operacional no Porto de Itajaí
    ('b1000000-0000-0000-0000-000000000001',
     'OPERACIONAL', 'Rua Blumenau', 'S/N', 'Terminal 01',
     'Centro', 'Itajaí', 'SC', '88301970'),

    -- Sul Fretes: sede em Florianópolis
    ('b1000000-0000-0000-0000-000000000002',
     'SEDE', 'Av. Mauro Ramos', '800', 'Sala 201',
     'Centro', 'Florianópolis', 'SC', '88020302');

-- ==============================================================
-- BLOCO 5 — DRIVER PROFILES
--
-- carlos  → disponível + aprovado_gr  → ELEGÍVEL
-- marcos  → disponível + aprovado_gr  → ELEGÍVEL (CRLV pendente)
-- jose    → indisponível              → NÃO aparece no matching
-- ana     → disponível, aprovado_gr=FALSE → filtrado pelo critério GR
-- pedro   → disponível + aprovado_gr, mas CNH vencida → filtrado por documento
-- ==============================================================

INSERT INTO driver_profiles (
    id, user_id, cpf, nome_completo, telefone,
    cnh_numero, cnh_categoria, cnh_validade,
    latitude, longitude, location_updated_at,
    disponivel, aprovado_gr, avaliacao_media, total_viagens
) VALUES

      -- Carlos — elegível completo (carreta, São José/SC)
      ('b2000000-0000-0000-0000-000000000001',
       'a2000000-0000-0000-0000-000000000001',
       '12345678901', 'Carlos Eduardo Silva', '48991230001',
       'SC123456789', 'E', '2027-06-30',
       -27.5949, -48.5882, NOW(),
       TRUE, TRUE, 4.80, 127),

      -- Marcos — elegível, mas com CRLV pendente (bitruck, Florianópolis/SC)
      ('b2000000-0000-0000-0000-000000000002',
       'a2000000-0000-0000-0000-000000000002',
       '23456789012', 'Marcos Antonio Souza', '48991230002',
       'SC234567890', 'E', '2026-12-15',
       -27.5969, -48.5495, NOW(),
       TRUE, TRUE, 4.60, 89),

      -- José — indisponível (em viagem com truck)
      ('b2000000-0000-0000-0000-000000000003',
       'a2000000-0000-0000-0000-000000000003',
       '34567890123', 'José Carlos Pereira', '48991230003',
       'SC345678901', 'D', '2026-08-20',
       -27.6136, -48.5200, NOW() - INTERVAL '2 hours',
       FALSE, TRUE, 4.20, 54),

      -- Ana — disponível mas NÃO aprovada pela GR
      ('b2000000-0000-0000-0000-000000000004',
       'a2000000-0000-0000-0000-000000000004',
       '45678901234', 'Ana Paula Rodrigues', '48991230004',
       'SC456789012', 'C', '2028-09-10',
       -27.5800, -48.5600, NOW(),
       TRUE, FALSE, 0.00, 0),

      -- Pedro — disponível + aprovado_gr, mas CNH vencida
      ('b2000000-0000-0000-0000-000000000005',
       'a2000000-0000-0000-0000-000000000005',
       '56789012345', 'Pedro Henrique Alves', '48991230005',
       'SC567890123', 'E', '2025-01-15',   -- CNH vencida
       -27.5700, -48.5750, NOW(),
       TRUE, TRUE, 3.90, 22);

-- ==============================================================
-- BLOCO 6 — VEHICLES
-- ==============================================================

INSERT INTO vehicles (
    id, driver_id, vehicle_type_id,
    placa, marca, modelo, ano_fabricacao,
    capacidade_ton, possui_rastreador, rastreador_empresa, ativo
) VALUES

      -- Carlos: carreta com rastreador Sascar
      ('c1000000-0000-0000-0000-000000000001',
       'b2000000-0000-0000-0000-000000000001',
       (SELECT id FROM vehicle_types WHERE nome = 'CARRETA'),
       'SDF1A23', 'Volvo', 'FH 540', 2021,
       28.00, TRUE, 'Sascar', TRUE),

      -- Marcos: bitruck com rastreador Onixsat
      ('c1000000-0000-0000-0000-000000000002',
       'b2000000-0000-0000-0000-000000000002',
       (SELECT id FROM vehicle_types WHERE nome = 'BITRUCK'),
       'ABC2B34', 'Scania', 'R 450', 2020,
       14.00, TRUE, 'Onixsat', TRUE),

      -- José: truck sem rastreador
      ('c1000000-0000-0000-0000-000000000003',
       'b2000000-0000-0000-0000-000000000003',
       (SELECT id FROM vehicle_types WHERE nome = 'TRUCK'),
       'GHJ3C45', 'Mercedes-Benz', 'Atego 2430', 2019,
       8.50, FALSE, NULL, TRUE),

      -- Ana: van com rastreador Cobli
      ('c1000000-0000-0000-0000-000000000004',
       'b2000000-0000-0000-0000-000000000004',
       (SELECT id FROM vehicle_types WHERE nome = 'VAN'),
       'MNO4D56', 'Ford', 'Transit 350L', 2022,
       1.50, TRUE, 'Cobli', TRUE),

      -- Pedro: carreta com rastreador (mas CNH vencida)
      ('c1000000-0000-0000-0000-000000000005',
       'b2000000-0000-0000-0000-000000000005',
       (SELECT id FROM vehicle_types WHERE nome = 'CARRETA'),
       'PQR5E67', 'Scania', 'R 500', 2022,
       28.00, TRUE, 'Sascar', TRUE);

-- ==============================================================
-- BLOCO 7 — DOCUMENTS
--
-- Cenários:
--   Carlos  → CNH aprovada + CRLV aprovado            → docs OK
--   Marcos  → CNH aprovada + CRLV pendente            → doc incompleto
--   José    → CNH aprovada                            → docs OK
--   Ana     → CNH aprovada                            → docs OK (bloqueada pelo GR)
--   Pedro   → CNH aprovada mas EXPIRADA               → filtrado por doc
-- ==============================================================

INSERT INTO documents (
    driver_id, vehicle_id, type, status,
    arquivo_url, arquivo_nome, validade,
    validated_by, validated_at
) VALUES

      -- Carlos: CNH aprovada (validada pelo admin)
      ('b2000000-0000-0000-0000-000000000001', NULL,
       'CNH', 'APROVADO',
       'https://storage.dev/docs/carlos/cnh.pdf', 'cnh_carlos.pdf',
       '2027-06-30',
       'b3000000-0000-0000-0000-000000000002', NOW() - INTERVAL '10 days'),

      -- Carlos: CRLV da carreta aprovado
      ('b2000000-0000-0000-0000-000000000001',
       'c1000000-0000-0000-0000-000000000001',
       'CRLV', 'APROVADO',
       'https://storage.dev/docs/carlos/crlv.pdf', 'crlv_SDF1A23.pdf',
       '2025-12-31',
       'b3000000-0000-0000-0000-000000000002', NOW() - INTERVAL '10 days'),

      -- Carlos: IPVA aprovado
      ('b2000000-0000-0000-0000-000000000001',
       'c1000000-0000-0000-0000-000000000001',
       'IPVA', 'APROVADO',
       'https://storage.dev/docs/carlos/ipva.pdf', 'ipva_SDF1A23.pdf',
       '2025-12-31',
       'b3000000-0000-0000-0000-000000000002', NOW() - INTERVAL '10 days'),

      -- Marcos: CNH aprovada
      ('b2000000-0000-0000-0000-000000000002', NULL,
       'CNH', 'APROVADO',
       'https://storage.dev/docs/marcos/cnh.pdf', 'cnh_marcos.pdf',
       '2026-12-15',
       'b3000000-0000-0000-0000-000000000002', NOW() - INTERVAL '5 days'),

      -- Marcos: CRLV pendente (ainda não validado)
      ('b2000000-0000-0000-0000-000000000002',
       'c1000000-0000-0000-0000-000000000002',
       'CRLV', 'PENDENTE',
       'https://storage.dev/docs/marcos/crlv.pdf', 'crlv_ABC2B34.pdf',
       '2025-12-31',
       NULL, NULL),

      -- José: CNH aprovada
      ('b2000000-0000-0000-0000-000000000003', NULL,
       'CNH', 'APROVADO',
       'https://storage.dev/docs/jose/cnh.pdf', 'cnh_jose.pdf',
       '2026-08-20',
       'b3000000-0000-0000-0000-000000000002', NOW() - INTERVAL '20 days'),

      -- Ana: CNH aprovada
      ('b2000000-0000-0000-0000-000000000004', NULL,
       'CNH', 'APROVADO',
       'https://storage.dev/docs/ana/cnh.pdf', 'cnh_ana.pdf',
       '2028-09-10',
       'b3000000-0000-0000-0000-000000000002', NOW() - INTERVAL '3 days'),

      -- Pedro: CNH expirada (vencimento em 2025-01-15, já passou)
      ('b2000000-0000-0000-0000-000000000005', NULL,
       'CNH', 'EXPIRADO',
       'https://storage.dev/docs/pedro/cnh.pdf', 'cnh_pedro.pdf',
       '2025-01-15',
       'b3000000-0000-0000-0000-000000000001', NOW() - INTERVAL '120 days');

-- ==============================================================
-- BLOCO 8 — CARGOS
--
--  cargo-001: AGUARDANDO matching (carreta, carga geral, Rápida Cargo)
--  cargo-002: MOTORISTA_ALOCADO (bitruck, autopeças, Rápida Cargo)
--  cargo-003: EM_TRANSITO (truck, granel, Sul Fretes)
--  cargo-004: CONCLUIDO (van, material escritório, Sul Fretes)
--  cargo-005: CANCELADO (histórico, Rápida Cargo)
-- ==============================================================

INSERT INTO cargos (
    id, carrier_id, vehicle_type_id,
    origem_cidade, origem_estado, origem_endereco,
    destino_cidade, destino_estado, destino_endereco,
    tipo, descricao, peso_kg, valor_carga,
    data_coleta_limite, data_entrega_prevista,
    requer_escolta, requer_rastreador, requer_isca_eletronica, requer_aprovacao_gr,
    status
) VALUES

      -- cargo-001: aguardando matching — alvo do fluxo principal de teste
      ('d1000000-0000-0000-0000-000000000001',
       'b1000000-0000-0000-0000-000000000001',
       (SELECT id FROM vehicle_types WHERE nome = 'CARRETA'),
       'Itajaí', 'SC', 'Porto de Itajaí — Terminal 01',
       'São Paulo', 'SP', 'CD Anhanguera — Km 18',
       'CARGA_GERAL', 'Eletrônicos importados — 800 caixas',
       24000.00, 850000.00,
       NOW() + INTERVAL '6 hours', NOW() + INTERVAL '2 days',
       FALSE, TRUE, FALSE, TRUE,
       'AGUARDANDO'),

      -- cargo-002: motorista alocado (Carlos aceitou)
      ('d1000000-0000-0000-0000-000000000002',
       'b1000000-0000-0000-0000-000000000001',
       (SELECT id FROM vehicle_types WHERE nome = 'BITRUCK'),
       'Joinville', 'SC', 'Armazém Joinville — Av. JK, 1000',
       'Curitiba', 'PR', 'CD Sul — Rua das Araucárias, 200',
       'CARGA_GERAL', 'Autopeças — 320 volumes',
       12000.00, 120000.00,
       NOW() + INTERVAL '2 hours', NOW() + INTERVAL '1 day',
       FALSE, TRUE, FALSE, TRUE,
       'MOTORISTA_ALOCADO'),

      -- cargo-003: em trânsito (José dirigindo)
      ('d1000000-0000-0000-0000-000000000003',
       'b1000000-0000-0000-0000-000000000002',
       (SELECT id FROM vehicle_types WHERE nome = 'TRUCK'),
       'Florianópolis', 'SC', 'Porto de Florianópolis',
       'Blumenau', 'SC', 'Rua XV de Novembro, 1200',
       'GRANEL_SOLIDO', 'Grãos de soja — sacas 60kg',
       8000.00, 35000.00,
       NOW() - INTERVAL '3 hours', NOW() + INTERVAL '8 hours',
       FALSE, FALSE, FALSE, FALSE,
       'EM_TRANSITO'),

      -- cargo-004: concluído (histórico)
      ('d1000000-0000-0000-0000-000000000004',
       'b1000000-0000-0000-0000-000000000002',
       (SELECT id FROM vehicle_types WHERE nome = 'VAN'),
       'São José', 'SC', 'Rua das Palmeiras, 300',
       'Palhoça', 'SC', 'Av. das Nações, 500',
       'CARGA_GERAL', 'Materiais de escritório',
       500.00, 8000.00,
       NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day',
       FALSE, FALSE, FALSE, FALSE,
       'CONCLUIDO'),

      -- cargo-005: cancelado (histórico / soft delete)
      ('d1000000-0000-0000-0000-000000000005',
       'b1000000-0000-0000-0000-000000000001',
       (SELECT id FROM vehicle_types WHERE nome = 'CARRETA'),
       'Itajaí', 'SC', NULL,
       'Porto Alegre', 'RS', NULL,
       'CARGA_PERIGOSA', 'Produtos químicos — classe 3',
       18000.00, 200000.00,
       NOW() - INTERVAL '1 day', NULL,
       TRUE, TRUE, TRUE, TRUE,
       'CANCELADO');

-- ==============================================================
-- BLOCO 9 — CARGO MATCHES
-- Log do matching executado para cargo-002
-- ==============================================================

INSERT INTO cargo_matches (id, cargo_id, driver_id, vehicle_id, score, distancia_km)
VALUES
    -- Carlos: score mais alto — alocado
    ('e1000000-0000-0000-0000-000000000001',
     'd1000000-0000-0000-0000-000000000002',
     'b2000000-0000-0000-0000-000000000001',
     'c1000000-0000-0000-0000-000000000001',
     92.50, 45.20),

    -- Marcos: segundo lugar no ranking
    ('e1000000-0000-0000-0000-000000000002',
     'd1000000-0000-0000-0000-000000000002',
     'b2000000-0000-0000-0000-000000000002',
     'c1000000-0000-0000-0000-000000000002',
     88.10, 62.80);

-- ==============================================================
-- BLOCO 10 — OFFERS
-- Fluxo completo para cargo-002:
--   Carlos  → ACEITA (motorista alocado)
--   Marcos  → CANCELADA (sistema cancela após aceite do Carlos)
-- ==============================================================

INSERT INTO offers (
    id, cargo_id, driver_id, cargo_match_id,
    status, motivo_recusa, expira_em, respondida_em
) VALUES

      -- Carlos aceitou
      ('f1000000-0000-0000-0000-000000000001',
       'd1000000-0000-0000-0000-000000000002',
       'b2000000-0000-0000-0000-000000000001',
       'e1000000-0000-0000-0000-000000000001',
       'ACEITA', NULL,
       NOW() - INTERVAL '25 minutes',
       NOW() - INTERVAL '28 minutes'),

      -- Marcos cancelado pelo sistema após aceite do Carlos
      ('f1000000-0000-0000-0000-000000000002',
       'd1000000-0000-0000-0000-000000000002',
       'b2000000-0000-0000-0000-000000000002',
       'e1000000-0000-0000-0000-000000000002',
       'CANCELADA', NULL,
       NOW() - INTERVAL '25 minutes',
       NULL);

-- ==============================================================
-- RESUMO DOS DADOS INSERIDOS
-- ==============================================================
--
--  users            9  (2 carriers, 5 drivers, 2 admins)
--  carrier_profiles 2
--  driver_profiles  5
--  admin_profiles   2
--  addresses        3  (sede + op. Rápida Cargo; sede Sul Fretes)
--  vehicle_types    7  (inseridos na migration V3)
--  vehicles         5  (1 por motorista)
--  documents        8  (CNH/CRLV/IPVA de cada motorista)
--  cargos           5  (aguardando, alocado, trânsito, concluído, cancelado)
--  cargo_matches    2  (log do matching de cargo-002)
--  offers           2  (aceita + cancelada para cargo-002)
--
--  CREDENCIAIS DE ACESSO (senha: Test@1234)
--  admin@vaptuvupt.com.br      → ADMIN superadmin
--  operacoes@vaptuvupt.com.br  → ADMIN operações
--  logistica@rapidacargo.com.br → CARRIER Rápida Cargo
--  operacoes@sulfretes.com.br   → CARRIER Sul Fretes
--  carlos.silva@email.com       → DRIVER elegível
--  marcos.souza@email.com       → DRIVER elegível (CRLV pendente)
--  jose.pereira@email.com       → DRIVER indisponível
--  ana.rodrigues@email.com      → DRIVER sem aprovação GR
--  pedro.alves@email.com        → DRIVER com CNH vencida
-- ==============================================================
