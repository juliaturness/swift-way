# SwiftWay Backend – Full Flow (cURL Script)

Este documento contém o fluxo completo para testar o sistema:

* Criar Carrier
* Criar Driver
* Criar Vehicle
* Ativar Driver
* Atualizar localização
* Criar Cargo
* Rodar Matching
* Criar Offers
* Ver Feed do Driver

---

# ⚙️ Pré-requisitos

```bash
export BASE_URL="http://localhost:8082"
export CARRIER_TOKEN="SEU_TOKEN_CARRIER"
export DRIVER_TOKEN="SEU_TOKEN_DRIVER"
```

---

# 1. Criar Driver

```bash
curl -X POST "$BASE_URL/api/v1/auth/register" \
-H "Content-Type: application/json" \
-d '{
  "email": "driver@swiftway.com",
  "password": "123456",
  "role": "DRIVER",
  "fullName": "Joao da Silva",
  "cpf": "52998224725",
  "phone": "41999999999",
  "cnhNumber": "12345678901",
  "cnhCategory": "E",
  "cnhValidity": "2030-12-31"
}'
```

---

# 2. Criar Carrier

```bash
curl -X POST "$BASE_URL/api/v1/auth/register" \
-H "Content-Type: application/json" \
-d '{
  "email": "carrier@swiftway.com",
  "password": "123456",
  "role": "CARRIER",
  "cnpj": "11222333000181",
  "razaoSocial": "Transportadora Alpha LTDA",
  "nomeFantasia": "Alpha Transportes"
}'
```

---

# 3. Login (gerar tokens)

```bash
curl -X POST "$BASE_URL/api/v1/auth/login" \
-H "Content-Type: application/json" \
-d '{
  "email": "driver@swiftway.com",
  "password": "123456"
}'
```

```bash
curl -X POST "$BASE_URL/api/v1/auth/login" \
-H "Content-Type: application/json" \
-d '{
  "email": "carrier@swiftway.com",
  "password": "123456"
}'
```

---

# 4. Criar Vehicle (Driver)

```bash
curl -X POST "$BASE_URL/api/v1/drivers/me/vehicles" \
-H "Authorization: Bearer $DRIVER_TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "vehicleTypeId": 1,
  "licensePlate": "ABC1D23",
  "make": "Volvo",
  "model": "FH",
  "manufactureYear": 2022,
  "capacityTon": 10,
  "hasTracker": true,
  "trackerCompany": "Omnilink"
}'
```

---

# 5. Ativar Driver (available = true)

```bash
curl -X PUT "$BASE_URL/api/v1/drivers/$(curl -s -H "Authorization: Bearer $DRIVER_TOKEN" $BASE_URL/api/v1/drivers/me | jq -r .id)/availability" \
-H "Authorization: Bearer $DRIVER_TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "available": true
}'
```

---

# 6. Atualizar localização do Driver

```bash
curl -X PUT "$BASE_URL/api/v1/drivers/$(curl -s -H "Authorization: Bearer $DRIVER_TOKEN" $BASE_URL/api/v1/drivers/me | jq -r .id)/location" \
-H "Authorization: Bearer $DRIVER_TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "latitude": -25.4284,
  "longitude": -49.2733
}'
```

---

# 7. Criar Cargo

```bash
export CARGO_ID=$(curl -s -X POST "$BASE_URL/api/v1/cargos" \
-H "Authorization: Bearer $CARRIER_TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "vehicleTypeId": 1,
  "origemCidade": "Curitiba",
  "origemEstado": "PR",
  "origemEndereco": "Centro",
  "destinoCidade": "São Paulo",
  "destinoEstado": "SP",
  "destinoEndereco": "Av Paulista",
  "tipo": "CARGA_GERAL",
  "descricao": "Carga teste full flow",
  "pesoKg": 1000,
  "valorCarga": 5000,
  "dataColetaLimite": "2026-06-17T12:00:00",
  "dataEntregaPrevista": "2026-06-18T12:00:00",
  "requerEscolta": false,
  "requerRastreador": false,
  "requerIscaEletronica": false,
  "requerAprovacaoGr": false,
  "observacoes": "fluxo completo"
}' | jq -r '.id')
```

---

# 8. Atualizar status para MATCHING

```bash
curl -X PATCH "$BASE_URL/api/v1/cargos/$CARGO_ID/status" \
-H "Authorization: Bearer $CARRIER_TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "status": "MATCHING"
}'
```

---

# 9. Rodar Matching

```bash
curl -X POST "$BASE_URL/api/v1/cargos/$CARGO_ID/match/trigger" \
-H "Authorization: Bearer $CARRIER_TOKEN"
```

---

# 10. Criar Offers

```bash
curl -X POST "$BASE_URL/api/v1/cargos/$CARGO_ID/offers" \
-H "Authorization: Bearer $CARRIER_TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "expirationMinutes": 120
}'
```

---

# 11. Ver Feed do Driver

```bash
curl -X GET "$BASE_URL/api/v1/offers?page=0&size=20" \
-H "Authorization: Bearer $DRIVER_TOKEN"
```

---

# Resultado esperado

* Driver criado
* Carrier criado
* Vehicle cadastrado
* Driver ativo
* Location setada
* Cargo criado
* Status atualizado para MATCHING
* Matching executado
* Offer enviada
* Feed do driver preenchido
