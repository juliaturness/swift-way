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
import com.swiftway.backend.module.document.service.StorageService;
import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Offers", description = "Gestão de ofertas de carga para motoristas")
public class OfferController {

    private final OfferService offerService;
    private final StorageService storageService;


    /**
     * POST /api/v1/cargos/{id}/offers
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
     * Feed do motorista: apenas ofertas ENVIADA (pendentes).
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
     * GET /api/v1/trips
     *
     * Viagens do motorista autenticado: ofertas ACEITA com dados completos da carga.
     * Ordenadas por dataColetaLimite desc.
     */
    @GetMapping("/api/v1/trips")
    @PreAuthorize("hasRole('DRIVER')")
    @Operation(summary = "Lista viagens do motorista autenticado (ofertas aceitas)")
    public ResponseEntity<PageResponse<OfferResponse>> listMyTrips(
        @AuthenticationPrincipal UserDetails principal,
        @RequestParam(defaultValue = "0")  int page,
        @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, Math.min(size, 100),
            Sort.by(Sort.Direction.DESC, "createdAt"));

        return ResponseEntity.ok(
            offerService.listMyTrips(principal.getUsername(), pageable));
    }

    /**
     * POST /api/v1/offers/{id}/accept
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

    /**
     * POST /api/v1/trips/{offerId}/start
     *
     * Motorista marca o início da viagem (coleta realizada).
     * Efeitos colaterais: cargo → EM_TRANSITO.
     */
    @PostMapping("/api/v1/trips/{offerId}/start")
    @PreAuthorize("hasRole('DRIVER')")
    @Operation(summary = "Motorista inicia uma viagem (coleta realizada)")
    public ResponseEntity<OfferResponse> startTrip(
        @PathVariable UUID offerId,
        @AuthenticationPrincipal UserDetails principal) {

        return ResponseEntity.ok(offerService.startTrip(offerId, principal.getUsername()));
    }
    /**
     * POST /api/v1/trips/{offerId}/complete
     *
     * Motorista marca a entrega como concluída.
     * Efeitos colaterais: cargo → ENTREGUE.
     */
    @PostMapping(
    value    = "/api/v1/trips/{offerId}/complete",
    consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    @PreAuthorize("hasRole('DRIVER')")
    @Operation(summary = "Motorista conclui a entrega — foto obrigatória")
    public ResponseEntity<OfferResponse> completeTrip(
        @PathVariable UUID offerId,
        @AuthenticationPrincipal UserDetails principal,
        @RequestPart("foto") MultipartFile foto) {

        if (foto == null || foto.isEmpty())
            return ResponseEntity.badRequest().build();

        String url = storageService.saveDeliveryPhoto(foto);
        return ResponseEntity.ok(offerService.completeTrip(offerId, principal.getUsername(), url));
    }
}