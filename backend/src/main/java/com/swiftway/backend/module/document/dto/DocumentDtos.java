package com.swiftway.backend.module.document.dto;

import com.swiftway.backend.module.document.domain.DocumentStatus;
import com.swiftway.backend.module.document.domain.DocumentType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public final class DocumentDtos {

    private DocumentDtos() {}

    // ── Requests ──────────────────────────────────────────────────

    public record UploadDocumentRequest(

        @NotNull(message = "Tipo de documento é obrigatório")
        DocumentType type,

        // Opcional — apenas para documentos de veículo (CRLV, IPVA, FOTO_VEICULO)
        UUID vehicleId,

        // Opcional — null significa que o documento não vence
        LocalDate validade
    ) {}

    public record ValidateDocumentRequest(

        @NotNull(message = "Status é obrigatório")
        DocumentStatus status,   // só aceita APROVADO ou REJEITADO

        @Size(max = 500, message = "Motivo de rejeição deve ter no máximo 500 caracteres")
        String motivoRejeicao    // obrigatório quando status = REJEITADO
    ) {}

    // ── Responses ─────────────────────────────────────────────────

    public record DocumentResponse(
        UUID id,
        UUID driverId,
        UUID vehicleId,
        DocumentType type,
        DocumentStatus status,
        String arquivoUrl,
        String arquivoNome,
        LocalDate validade,
        String motivoRejeicao,
        UUID validatedBy,
        LocalDateTime validatedAt,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
    ) {}
}
