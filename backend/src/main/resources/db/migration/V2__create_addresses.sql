-- ==============================================================
-- V2 — Endereços das transportadoras
--
-- Separado de carrier_profiles para satisfazer a 3FN:
-- logradouro, cidade e CEP são fatos do endereço, não da
-- empresa. Cardinalidade 1:N — uma transportadora pode ter
-- sede e diversas filiais ou pontos operacionais.
-- ==============================================================

CREATE TYPE address_type AS ENUM ('SEDE', 'FILIAL', 'OPERACIONAL');

CREATE TABLE IF NOT EXISTS addresses (
   id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
   carrier_id  UUID         NOT NULL
       REFERENCES carrier_profiles (id) ON DELETE CASCADE,
   type        address_type NOT NULL DEFAULT 'SEDE',
   logradouro  VARCHAR(255) NOT NULL,
   numero      VARCHAR(20)  NOT NULL,
   complemento VARCHAR(100) NULL,
   bairro      VARCHAR(100) NOT NULL,
   cidade      VARCHAR(100) NOT NULL,
   estado      CHAR(2)      NOT NULL,   -- sigla UF, ex: SC
   cep         CHAR(8)      NOT NULL,   -- somente dígitos, sem hífen
   created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
   updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_addresses_carrier_id ON addresses (carrier_id);
CREATE INDEX idx_addresses_type       ON addresses (type);

COMMENT ON TABLE addresses           IS 'Endereços vinculados a uma transportadora (sede, filiais, pontos operacionais).';
COMMENT ON COLUMN addresses.estado    IS 'Sigla da UF com 2 caracteres, ex: SC.';
COMMENT ON COLUMN addresses.cep       IS 'CEP sem hífen — somente os 8 dígitos.';
COMMENT ON COLUMN addresses.type      IS 'SEDE = endereço principal; FILIAL = unidade secundária; OPERACIONAL = ponto de coleta/entrega.';
