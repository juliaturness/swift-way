-- ==============================================================
-- V4 — Documentos dos motoristas
--
-- Cada documento é um registro independente, permitindo
-- rastrear histórico completo de uploads e revalidações.
-- O campo validated_by referencia admin_profiles, criando
-- rastreabilidade de qual administrador aprovou ou rejeitou.
-- ==============================================================

CREATE TYPE document_type AS ENUM (
'CNH',
'CRLV',
'IPVA',
'LICENCIAMENTO',
'FOTO_VEICULO',
'CNPJ',
'COMPROVANTE_RESIDENCIA',
'ANTECEDENTES_CRIMINAIS'
);

CREATE TYPE document_status AS ENUM (
'PENDENTE',   -- enviado, aguardando análise pelo admin
'APROVADO',   -- validado e ativo
'REJEITADO',  -- reprovado; campo motivo_rejeicao obrigatório
'EXPIRADO'    -- vencimento ultrapassado; atualizado por job agendado
);

CREATE TABLE documents (
   id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
   driver_id       UUID            NOT NULL
       REFERENCES driver_profiles (id) ON DELETE CASCADE,
   vehicle_id      UUID            NULL
            REFERENCES vehicles (id) ON DELETE SET NULL,

-- Conteúdo
   type            document_type   NOT NULL,
   status          document_status NOT NULL DEFAULT 'PENDENTE',
   arquivo_url     VARCHAR(500)    NOT NULL,   -- URL no S3 / MinIO
   arquivo_nome    VARCHAR(255)    NOT NULL,
   validade        DATE            NULL,        -- NULL = documento sem vencimento

-- Validação — realizada por um administrador
   motivo_rejeicao VARCHAR(500)    NULL,        -- obrigatório quando REJEITADO
   validated_by    UUID            NULL
            REFERENCES admin_profiles (id) ON DELETE SET NULL,
   validated_at    TIMESTAMPTZ     NULL,

   created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
   updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_documents_driver_id    ON documents (driver_id);
CREATE INDEX idx_documents_vehicle_id   ON documents (vehicle_id)   WHERE vehicle_id IS NOT NULL;
CREATE INDEX idx_documents_status       ON documents (status);
CREATE INDEX idx_documents_validated_by ON documents (validated_by) WHERE validated_by IS NOT NULL;

-- Documentos aprovados com vencimento — usado pelo job de expiração automática
CREATE INDEX idx_documents_validade
ON documents (validade)
WHERE validade IS NOT NULL AND status = 'APROVADO';

-- Garante apenas 1 documento ativo (PENDENTE ou APROVADO) por tipo por motorista.
-- Para reenviar, o anterior deve estar REJEITADO ou EXPIRADO.
CREATE UNIQUE INDEX idx_documents_driver_type_ativo
ON documents (driver_id, type)
WHERE status IN ('PENDENTE', 'APROVADO');

COMMENT ON TABLE  documents                 IS 'Documentos enviados pelos motoristas para validação pelo administrador.';
COMMENT ON COLUMN documents.vehicle_id      IS 'Preenchido quando o documento é de um veículo específico (ex: CRLV, IPVA, FOTO_VEICULO).';
COMMENT ON COLUMN documents.validade        IS 'Data de vencimento. NULL indica que o documento não expira por prazo.';
COMMENT ON COLUMN documents.validated_by    IS 'admin_profiles.id do administrador que realizou a validação.';
COMMENT ON COLUMN documents.motivo_rejeicao IS 'Descrição obrigatória do motivo quando status = REJEITADO.';
