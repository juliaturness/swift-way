package com.swiftway.backend.module.cargo.controller;

import com.swiftway.backend.module.cargo.domain.enums.CargoStatus;
import com.swiftway.backend.module.cargo.domain.enums.CargoTipo;
import com.swiftway.backend.module.cargo.dto.CargoDtos.*;
import com.swiftway.backend.module.cargo.service.CargoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/cargos")
@RequiredArgsConstructor
@Tag(name = "Cargos", description = "Gestão de cargas e matching com motoristas")
@SecurityRequirement(name = "bearerAuth")
public class CargoController {

    private final CargoService cargoService;

    @PostMapping
    @PreAuthorize("hasRole('CARRIER')")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Cria uma nova carga")
    public ResponseEntity<CargoResponse> create(
        @AuthenticationPrincipal UserDetails principal,
        @Valid @RequestBody CreateCargoRequest request) {

        CargoResponse response = cargoService.create(principal.getUsername(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Lista cargas com filtros e paginação")
    public ResponseEntity<PageResponse<CargoSummaryResponse>> list(
        @RequestParam(required = false) CargoStatus status,
        @RequestParam(required = false) CargoTipo tipo,
        @RequestParam(required = false) String origem,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dataInicio,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dataFim,
        @RequestParam(defaultValue = "0")           int page,
        @RequestParam(defaultValue = "20")          int size,
        @RequestParam(defaultValue = "createdAt")   String sort,
        @RequestParam(defaultValue = "desc")        String direction) {

        Sort.Direction dir = Sort.Direction.fromOptionalString(direction)
            .orElse(Sort.Direction.DESC);
        Pageable pageable = PageRequest.of(page, Math.min(size, 100), Sort.by(dir, sort));

        return ResponseEntity.ok(
            cargoService.list(status, tipo, origem, dataInicio, dataFim, pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Retorna detalhes de uma carga")
    public ResponseEntity<CargoResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(cargoService.getById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('CARRIER')")
    @Operation(summary = "Atualiza uma carga (somente status AGUARDANDO)")
    public ResponseEntity<CargoResponse> update(
        @PathVariable UUID id,
        @AuthenticationPrincipal UserDetails principal,
        @Valid @RequestBody UpdateCargoRequest request) {

        return ResponseEntity.ok(cargoService.update(id, principal.getUsername(), request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('CARRIER')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Soft delete de uma carga (somente status AGUARDANDO)")
    public ResponseEntity<Void> delete(
        @PathVariable UUID id,
        @AuthenticationPrincipal UserDetails principal) {

        cargoService.delete(id, principal.getUsername());
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('CARRIER', 'ADMIN')")
    @Operation(summary = "Atualiza o status de uma carga")
    public ResponseEntity<CargoResponse> updateStatus(
        @PathVariable UUID id,
        @AuthenticationPrincipal UserDetails principal,
        @Valid @RequestBody UpdateCargoStatusRequest request) {

        return ResponseEntity.ok(
            cargoService.updateStatus(id, principal.getUsername(), request));
    }

    @PostMapping("/{id}/match/trigger")
    @PreAuthorize("hasRole('CARRIER')")
    @Operation(summary = "Aciona o algoritmo de matching para uma carga")
    public ResponseEntity<MatchResultResponse> triggerMatching(
        @PathVariable UUID id,
        @AuthenticationPrincipal UserDetails principal) {

        return ResponseEntity.ok(cargoService.triggerMatching(id, principal.getUsername()));
    }
}
