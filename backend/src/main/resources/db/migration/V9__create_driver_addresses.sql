CREATE TABLE IF NOT EXISTS driver_addresses (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id   UUID NOT NULL UNIQUE REFERENCES driver_profiles(id),
    cep         VARCHAR(8),
    logradouro  VARCHAR(255),
    numero      VARCHAR(20),
    complemento VARCHAR(100),
    bairro      VARCHAR(100),
    cidade      VARCHAR(100),
    estado      VARCHAR(2),
    ibge        VARCHAR(7)
);