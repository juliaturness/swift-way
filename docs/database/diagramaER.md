# Diagrama Entidade-Relacionamento — VAPT VUPT

> Mermaid — renderiza nativamente no GitHub.

## Diagrama ER Completo

```mermaid
erDiagram

    users {
        uuid        id          PK
        varchar     email       UK
        varchar     password
        user_role   role        "DRIVER | CARRIER | ADMIN"
        boolean     active
        timestamptz created_at
        timestamptz deleted_at  "soft delete"
    }

    carrier_profiles {
        uuid        id           PK
        uuid        user_id      FK
        char14      cnpj         UK
        varchar     razao_social
        varchar     nome_fantasia
        varchar     telefone
        timestamptz deleted_at
    }

    driver_profiles {
        uuid        id                   PK
        uuid        user_id              FK
        char11      cpf                  UK
        varchar     nome_completo
        varchar     cnh_numero           UK
        varchar     cnh_categoria
        date        cnh_validade
        decimal     latitude
        decimal     longitude
        boolean     disponivel
        boolean     aprovado_gr
        decimal     avaliacao_media
        integer     total_viagens
        timestamptz deleted_at
    }

    admin_profiles {
        uuid        id            PK
        uuid        user_id       FK
        varchar     nome_completo
        varchar     departamento
        boolean     superadmin
    }

    addresses {
        uuid         id          PK
        uuid         carrier_id  FK
        address_type type
        varchar      logradouro
        varchar      cidade
        char2        estado
        char8        cep
    }

    vehicle_types {
        smallserial id     PK
        varchar     nome   UK
        varchar     descricao
    }

    vehicles {
        uuid        id                PK
        uuid        driver_id         FK
        smallint    vehicle_type_id   FK
        varchar     placa             UK
        varchar     marca
        varchar     modelo
        decimal     capacidade_ton
        boolean     possui_rastreador
        boolean     ativo
    }

    documents {
        uuid            id              PK
        uuid            driver_id       FK
        uuid            vehicle_id      FK  "nullable"
        uuid            validated_by    FK  "nullable — admin"
        document_type   type
        document_status status
        varchar         arquivo_url
        date            validade        "nullable"
        varchar         motivo_rejeicao "nullable"
    }

    cargos {
        uuid         id                      PK
        uuid         carrier_id              FK
        smallint     vehicle_type_id         FK
        varchar      origem_cidade
        char2        origem_estado
        varchar      destino_cidade
        char2        destino_estado
        cargo_tipo   tipo
        decimal      peso_kg
        timestamptz  data_coleta_limite
        boolean      requer_escolta
        boolean      requer_rastreador
        boolean      requer_aprovacao_gr
        cargo_status status
        timestamptz  deleted_at
    }

    cargo_matches {
        uuid        id           PK
        uuid        cargo_id     FK
        uuid        driver_id    FK
        uuid        vehicle_id   FK
        decimal     score
        decimal     distancia_km
    }

    offers {
        uuid         id              PK
        uuid         cargo_id        FK
        uuid         driver_id       FK
        uuid         cargo_match_id  FK  "nullable"
        offer_status status
        varchar      motivo_recusa   "nullable"
        timestamptz  expira_em
        timestamptz  respondida_em
    }

    users            ||--o| carrier_profiles  : "1:1 role CARRIER"
    users            ||--o| driver_profiles   : "1:1 role DRIVER"
    users            ||--o| admin_profiles    : "1:1 role ADMIN"

    carrier_profiles ||--|{ addresses         : "1:N"
    carrier_profiles ||--|{ cargos            : "1:N"

    driver_profiles  ||--|{ vehicles          : "1:N"
    driver_profiles  ||--|{ documents         : "1:N"
    driver_profiles  ||--|{ cargo_matches     : "1:N"
    driver_profiles  ||--|{ offers            : "1:N"

    vehicles         }o--|| vehicle_types     : "N:1"
    vehicles         ||--o{ documents         : "1:N docs do veículo"

    cargos           }o--|| vehicle_types     : "N:1"
    cargos           ||--|{ cargo_matches     : "1:N"
    cargos           ||--|{ offers            : "1:N"

    cargo_matches    ||--o{ offers            : "1:N"

    admin_profiles   ||--o{ documents         : "valida documentos"
```

---

## ENUMs

| ENUM | Valores |
|------|---------|
| `user_role` | `DRIVER`, `CARRIER`, `ADMIN` |
| `address_type` | `SEDE`, `FILIAL`, `OPERACIONAL` |
| `document_type` | `CNH`, `CRLV`, `IPVA`, `LICENCIAMENTO`, `FOTO_VEICULO`, `CNPJ`, `COMPROVANTE_RESIDENCIA`, `ANTECEDENTES_CRIMINAIS` |
| `document_status` | `PENDENTE`, `APROVADO`, `REJEITADO`, `EXPIRADO` |
| `cargo_tipo` | `CARGA_GERAL`, `CARGA_FRIGORIFICADA`, `CARGA_PERIGOSA`, `CARGA_VIVA`, `GRANEL_SOLIDO`, `GRANEL_LIQUIDO`, `CARGA_INDIVISIVEL`, `VEICULOS` |
| `cargo_status` | `AGUARDANDO`, `MATCHING`, `OFERTA_ENVIADA`, `MOTORISTA_ALOCADO`, `EM_TRANSITO`, `CONCLUIDO`, `CANCELADO` |
| `offer_status` | `ENVIADA`, `ACEITA`, `RECUSADA`, `EXPIRADA`, `CANCELADA` |

---

## Estratégia de perfis (3 roles)

A tabela `users` centraliza autenticação. Cada role possui sua própria tabela de perfil com relacionamento 1:1, o que satisfaz a 3FN — os atributos de cada perfil dependem apenas da própria chave, não de atributos de `users`.

| Role | Tabela de perfil | Atributos exclusivos |
|------|-----------------|----------------------|
| `CARRIER` | `carrier_profiles` | CNPJ, razão social, nome fantasia |
| `DRIVER` | `driver_profiles` | CPF, CNH, geolocalização, disponibilidade, aprovação GR |
| `ADMIN` | `admin_profiles` | departamento, flag superadmin |

O admin interage com o sistema através de `admin_profiles.validated_by` em `documents`, permitindo rastrear qual administrador aprovou ou rejeitou cada documento.

---

## Justificativa de normalização (3FN)

| Decisão | Justificativa |
|---------|---------------|
| Tabelas de perfil separadas de `users` | Atributos de cada perfil dependem da chave do perfil, não de `users` — elimina dependência transitiva |
| `addresses` separado de `carrier_profiles` | CEP, cidade e UF são fatos do endereço, não da empresa |
| `vehicle_types` separado de `vehicles` | Descrição do tipo depende do `id` do tipo, não da placa — elimina dependência transitiva |
| `documents` separado de `driver_profiles` | Um motorista tem múltiplos documentos com ciclos de vida independentes |
| `cargo_matches` separado de `offers` | Score do algoritmo e resposta do motorista são fatos distintos |
| ENUMs no banco | Integridade de domínio sem tabela auxiliar para valores estáveis |