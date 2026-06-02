package com.swiftway.backend.module.document.mapper;

import com.swiftway.backend.module.document.domain.Document;
import com.swiftway.backend.module.document.dto.DocumentDtos.DocumentResponse;
import org.springframework.stereotype.Component;

@Component
public class DocumentMapper {

    public DocumentResponse toResponse(Document d) {
        return new DocumentResponse(
            d.getId(),
            d.getDriver().getId(),
            d.getVehicle() != null ? d.getVehicle().getId() : null,
            d.getType(),
            d.getStatus(),
            d.getArquivoUrl(),
            d.getArquivoNome(),
            d.getValidade(),
            d.getMotivoRejeicao(),
            d.getValidatedBy(),
            d.getValidatedAt(),
            d.getCreatedAt(),
            d.getUpdatedAt()
        );
    }
}
