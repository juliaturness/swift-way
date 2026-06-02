package com.swiftway.backend.module.document.controller;

import com.swiftway.backend.module.document.dto.DocumentDtos.*;
import com.swiftway.backend.module.document.service.DocumentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/drivers")
@RequiredArgsConstructor
@Tag(name = "Documents", description = "Upload e validação de documentos dos motoristas")
@SecurityRequirement(name = "bearerAuth")
public class DocumentController {

    private final DocumentService documentService;

    @PostMapping(value = "/me/documents", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('DRIVER')")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Upload de documento do motorista autenticado (multipart/form-data)")
    public ResponseEntity<DocumentResponse> upload(
        @AuthenticationPrincipal UserDetails principal,
        @RequestPart("file") MultipartFile file,
        @RequestPart("type") String type,
        @RequestPart(value = "vehicleId", required = false) String vehicleId,
        @RequestPart(value = "validade",  required = false) String validade) {

        UploadDocumentRequest req = new UploadDocumentRequest(
            com.swiftway.backend.module.document.domain.DocumentType.valueOf(type),
            vehicleId != null ? UUID.fromString(vehicleId) : null,
            validade  != null ? LocalDate.parse(validade)  : null
        );

        DocumentResponse response = documentService.upload(principal.getUsername(), file, req);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/me/documents")
    @PreAuthorize("hasRole('DRIVER')")
    @Operation(summary = "Lista todos os documentos do motorista autenticado")
    public ResponseEntity<List<DocumentResponse>> listMyDocuments(
        @AuthenticationPrincipal UserDetails principal) {

        return ResponseEntity.ok(documentService.listMyDocuments(principal.getUsername()));
    }

    @PatchMapping("/{driverId}/documents/{docId}/validate")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Aprova ou rejeita um documento (admin)")
    public ResponseEntity<DocumentResponse> validate(
        @PathVariable UUID driverId,
        @PathVariable UUID docId,
        @AuthenticationPrincipal UserDetails principal,
        @Valid @RequestBody ValidateDocumentRequest request) {

        // adminId vem do contexto de segurança — seria buscado via AdminRepository
        // simplificado aqui: passa null e o service apenas loga
        // TODO: buscar admin_profiles.id pelo email do principal
        UUID adminId = null;

        return ResponseEntity.ok(
            documentService.validate(driverId, docId, adminId, request));
    }
}
