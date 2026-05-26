package com.swiftway.backend.module.carrier.dto;

import com.swiftway.backend.module.carrier.domain.AddressType;
import com.swiftway.backend.shared.validation.ValidCNPJ;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public final class CarrierDtos {

    private CarrierDtos() {}

    // ── Requests ──────────────────────────────────────────────────

    public record UpdateCarrierRequest(

        @NotBlank(message = "Razão social é obrigatória")
        @Size(max = 255)
        String razaoSocial,

        @Size(max = 255)
        String nomeFantasia,

        @NotBlank(message = "Telefone é obrigatório")
        @Size(max = 20)
        String telefone,

        @ValidCNPJ
        @NotBlank(message = "CNPJ é obrigatório")
        String cnpj
    ) {}

    public record CreateAddressRequest(

        @NotNull(message = "Tipo do endereço é obrigatório")
        AddressType type,

        @NotBlank(message = "Logradouro é obrigatório")
        @Size(max = 255)
        String logradouro,

        @NotBlank(message = "Número é obrigatório")
        @Size(max = 20)
        String numero,

        @Size(max = 100)
        String complemento,

        @NotBlank(message = "Bairro é obrigatório")
        @Size(max = 100)
        String bairro,

        @NotBlank(message = "Cidade é obrigatória")
        @Size(max = 100)
        String cidade,

        @NotBlank(message = "Estado é obrigatório")
        @Size(min = 2, max = 2, message = "Estado deve ter exatamente 2 caracteres (UF)")
        String estado,

        @NotBlank(message = "CEP é obrigatório")
        @Pattern(regexp = "^\\d{8}$", message = "CEP deve conter exatamente 8 dígitos")
        String cep
    ) {}

    public record UpdateAddressRequest(

        // type não é alterável após criação — mude removendo e recriando
        @NotBlank(message = "Logradouro é obrigatório")
        @Size(max = 255)
        String logradouro,

        @NotBlank(message = "Número é obrigatório")
        @Size(max = 20)
        String numero,

        @Size(max = 100)
        String complemento,

        @NotBlank(message = "Bairro é obrigatório")
        @Size(max = 100)
        String bairro,

        @NotBlank(message = "Cidade é obrigatória")
        @Size(max = 100)
        String cidade,

        @NotBlank(message = "Estado é obrigatório")
        @Size(min = 2, max = 2, message = "Estado deve ter exatamente 2 caracteres (UF)")
        String estado,

        @NotBlank(message = "CEP é obrigatório")
        @Pattern(regexp = "^\\d{8}$", message = "CEP deve conter exatamente 8 dígitos")
        String cep
    ) {}

    // ── Responses ─────────────────────────────────────────────────

    public record CarrierResponse(
        UUID id,
        UUID userId,
        String email,
        String cnpj,
        String razaoSocial,
        String nomeFantasia,
        String telefone,
        List<AddressResponse> addresses,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
    ) {}

    public record CarrierPublicResponse(
        UUID id,
        String razaoSocial,
        String nomeFantasia,
        String telefone,
        List<AddressResponse> addresses
    ) {}

    public record AddressResponse(
        UUID id,
        AddressType type,
        String logradouro,
        String numero,
        String complemento,
        String bairro,
        String cidade,
        String estado,
        String cep
    ) {}
}
