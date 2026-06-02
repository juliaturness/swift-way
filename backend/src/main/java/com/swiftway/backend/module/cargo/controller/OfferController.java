package com.swiftway.backend.module.cargo.controller;

import com.swiftway.backend.module.cargo.dto.OfferDtos.*;
import com.swiftway.backend.module.cargo.service.OfferService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Offers", description = "Gestão de ofertas de carga para motoristas")
public class OfferController {

    private final OfferService offerService;

    /**
     * POST /api/v1/cargos/{id}/offers
     *
     * Transportadora cria ofertas para os motoristas elegíveis (resultado do match).
     * O body é opcional: sem driverIds, todos os motoristas do match recebem oferta.
     */
    @PostMapping("/api/v1/cargos/{id}/offers")
    @PreAuthorize("hasRole('CARRIER')")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Cria ofertas para motoristas elegíveis de uma carga")
    public ResponseEntity<CreateOffersResponse> createOffers(
        @PathVariable UUID id,
        @AuthenticationPrincipal UserDetails principal,
        @Valid @RequestBody(required = false) CreateOffersRequest request) {

        CreateOffersRequest req = request != null
            ? request
            : new CreateOffersRequest(null, null);

        CreateOffersResponse response = offerService.createOffers(id, principal.getUsername(), req);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * GET /api/v1/offers
     *
     * Feed do motorista autenticado: ofertas pendentes (ENVIADA), mais recentes primeiro.
     */
    @GetMapping("/api/v1/offers")
    @PreAuthorize("hasRole('DRIVER')")
    @Operation(summary = "Lista ofertas pendentes do motorista autenticado")
    public ResponseEntity<PageResponse<OfferResponse>> listMyOffers(
        @AuthenticationPrincipal UserDetails principal,
        @RequestParam(defaultValue = "0")  int page,
        @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, Math.min(size, 100),
            Sort.by(Sort.Direction.DESC, "createdAt"));

        return ResponseEntity.ok(
            offerService.listMyOffers(principal.getUsername(), pageable));
    }

    /**
     * POST /api/v1/offers/{id}/accept
     *
     * Motorista aceita a oferta.
     * Efeitos colaterais: carga → MOTORISTA_ALOCADO; demais ofertas → CANCELADA.
     */
    @PostMapping("/api/v1/offers/{id}/accept")
    @PreAuthorize("hasRole('DRIVER')")
    @Operation(summary = "Motorista aceita uma oferta de carga")
    public ResponseEntity<OfferResponse> accept(
        @PathVariable UUID id,
        @AuthenticationPrincipal UserDetails principal) {

        return ResponseEntity.ok(offerService.accept(id, principal.getUsername()));
    }

    /**
     * POST /api/v1/offers/{id}/decline
     *
     * Motorista recusa a oferta, com motivo opcional.
     */
    @PostMapping("/api/v1/offers/{id}/decline")
    @PreAuthorize("hasRole('DRIVER')")
    @Operation(summary = "Motorista recusa uma oferta de carga")
    public ResponseEntity<OfferResponse> decline(
        @PathVariable UUID id,
        @AuthenticationPrincipal UserDetails principal,
        @Valid @RequestBody(required = false) DeclineOfferRequest request) {

        String motivo = request != null ? request.motivoRecusa() : null;
        return ResponseEntity.ok(offerService.decline(id, principal.getUsername(), motivo));
    }
}
