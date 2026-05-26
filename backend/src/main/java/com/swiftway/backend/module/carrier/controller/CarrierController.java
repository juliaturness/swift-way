package com.swiftway.backend.module.carrier.controller;

import com.swiftway.backend.module.carrier.dto.CarrierDtos.*;
import com.swiftway.backend.module.carrier.service.CarrierService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/carriers")
@RequiredArgsConstructor
@Tag(name = "Carriers", description = "Gestão de transportadoras e seus endereços")
@SecurityRequirement(name = "bearerAuth")
public class CarrierController {

    private final CarrierService carrierService;

    // ── Perfil ─────────────────────────────────────────────────────

    @GetMapping("/me")
    @PreAuthorize("hasRole('CARRIER')")
    @Operation(summary = "Retorna o perfil completo da transportadora autenticada")
    public ResponseEntity<CarrierResponse> getMyProfile(
        @AuthenticationPrincipal UserDetails principal) {

        return ResponseEntity.ok(carrierService.getMyProfile(principal.getUsername()));
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('CARRIER')")
    @Operation(summary = "Atualiza dados cadastrais da transportadora autenticada")
    public ResponseEntity<CarrierResponse> updateMyProfile(
        @AuthenticationPrincipal UserDetails principal,
        @Valid @RequestBody UpdateCarrierRequest request) {

        return ResponseEntity.ok(
            carrierService.updateMyProfile(principal.getUsername(), request));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Dados públicos de uma transportadora (qualquer usuário autenticado)")
    public ResponseEntity<CarrierPublicResponse> getPublicProfile(@PathVariable UUID id) {
        return ResponseEntity.ok(carrierService.getPublicProfile(id));
    }

    // ── Endereços ──────────────────────────────────────────────────

    @GetMapping("/me/addresses")
    @PreAuthorize("hasRole('CARRIER')")
    @Operation(summary = "Lista todos os endereços da transportadora autenticada")
    public ResponseEntity<List<AddressResponse>> listAddresses(
        @AuthenticationPrincipal UserDetails principal) {

        return ResponseEntity.ok(carrierService.listAddresses(principal.getUsername()));
    }

    @PostMapping("/me/addresses")
    @PreAuthorize("hasRole('CARRIER')")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Adiciona um novo endereço (SEDE, FILIAL ou OPERACIONAL)")
    public ResponseEntity<AddressResponse> addAddress(
        @AuthenticationPrincipal UserDetails principal,
        @Valid @RequestBody CreateAddressRequest request) {

        AddressResponse response = carrierService.addAddress(principal.getUsername(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/me/addresses/{addressId}")
    @PreAuthorize("hasRole('CARRIER')")
    @Operation(summary = "Atualiza um endereço existente da transportadora")
    public ResponseEntity<AddressResponse> updateAddress(
        @AuthenticationPrincipal UserDetails principal,
        @PathVariable UUID addressId,
        @Valid @RequestBody UpdateAddressRequest request) {

        return ResponseEntity.ok(
            carrierService.updateAddress(principal.getUsername(), addressId, request));
    }

    @DeleteMapping("/me/addresses/{addressId}")
    @PreAuthorize("hasRole('CARRIER')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Remove um endereço da transportadora")
    public ResponseEntity<Void> removeAddress(
        @AuthenticationPrincipal UserDetails principal,
        @PathVariable UUID addressId) {

        carrierService.removeAddress(principal.getUsername(), addressId);
        return ResponseEntity.noContent().build();
    }
}
