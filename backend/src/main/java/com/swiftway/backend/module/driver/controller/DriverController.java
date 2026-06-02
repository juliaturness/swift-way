package com.swiftway.backend.module.driver.controller;

import com.swiftway.backend.module.driver.dto.DriverDtos.*;
import com.swiftway.backend.module.driver.service.DriverService;
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

import java.util.List;
import java.util.UUID;

/**
 * Classe responsável pela implementação de endpoints da aplicação
 */
@RestController
@RequestMapping("/api/v1/drivers")
@RequiredArgsConstructor
@Tag(name = "Drivers", description = "Gestão de motoristas e veículos")
@SecurityRequirement(name = "bearerAuth")
public class DriverController {

    private final DriverService driverService;

    @GetMapping("/me")
    @PreAuthorize("hasRole('DRIVER')")
    @Operation(summary = "Retorna o perfil completo do motorista autenticado")
    public ResponseEntity<DriverResponse> getMyProfile(
        @AuthenticationPrincipal UserDetails principal) {

        return ResponseEntity.ok(driverService.getMyProfile(principal.getUsername()));
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('DRIVER')")
    @Operation(summary = "Atualiza dados de perfil do motorista autenticado")
    public ResponseEntity<DriverResponse> updateMyProfile(
        @AuthenticationPrincipal UserDetails principal,
        @Valid @RequestBody UpdateDriverRequest request) {

        return ResponseEntity.ok(driverService.updateMyProfile(principal.getUsername(), request));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Lista todos os motoristas com paginação (admin)")
    public ResponseEntity<PageResponse<DriverSummaryResponse>> listDrivers(
        @RequestParam(defaultValue = "0")  int page,
        @RequestParam(defaultValue = "20") int size,
        @RequestParam(defaultValue = "id") String sort,
        @RequestParam(defaultValue = "asc") String direction) {

        Sort.Direction dir = Sort.Direction.fromOptionalString(direction)
            .orElse(Sort.Direction.ASC);
        Pageable pageable = PageRequest.of(page, Math.min(size, 100), Sort.by(dir, sort));

        return ResponseEntity.ok(driverService.listDrivers(pageable));
    }

    @PutMapping("/{id}/availability")
    @PreAuthorize("hasAnyRole('DRIVER', 'ADMIN')")
    @Operation(summary = "Atualiza disponibilidade do motorista (próprio ou admin)")
    public ResponseEntity<AvailabilityResponse> updateAvailability(
        @PathVariable UUID id,
        @Valid @RequestBody UpdateAvailabilityRequest request,
        @AuthenticationPrincipal UserDetails principal) {

        return ResponseEntity.ok(
            driverService.updateAvailability(id, request, principal.getUsername()));
    }

    @PutMapping("/{id}/location")
    @PreAuthorize("hasAnyRole('DRIVER', 'ADMIN')")
    @Operation(summary = "Atualiza latitude/longitude do motorista (próprio ou admin)")
    public ResponseEntity<LocationResponse> updateLocation(
        @PathVariable UUID id,
        @Valid @RequestBody UpdateLocationRequest request,
        @AuthenticationPrincipal UserDetails principal) {

        return ResponseEntity.ok(
            driverService.updateLocation(id, request, principal.getUsername()));
    }

    @PostMapping("/me/vehicles")
    @PreAuthorize("hasRole('DRIVER')")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Cadastra um novo veículo para o motorista autenticado")
    public ResponseEntity<VehicleResponse> addVehicle(
        @AuthenticationPrincipal UserDetails principal,
        @Valid @RequestBody CreateVehicleRequest request) {

        VehicleResponse response = driverService.addVehicle(principal.getUsername(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/me/vehicles")
    @PreAuthorize("hasRole('DRIVER')")
    @Operation(summary = "Lista os veículos ativos do motorista autenticado")
    public ResponseEntity<List<VehicleResponse>> listMyVehicles(
        @AuthenticationPrincipal UserDetails principal) {

        return ResponseEntity.ok(driverService.listMyVehicles(principal.getUsername()));
    }

    @DeleteMapping("/me/vehicles/{vehicleId}")
    @PreAuthorize("hasRole('DRIVER')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Remove (soft delete) um veículo do motorista autenticado")
    public ResponseEntity<Void> removeVehicle(
        @AuthenticationPrincipal UserDetails principal,
        @PathVariable UUID vehicleId) {

        driverService.removeVehicle(principal.getUsername(), vehicleId);
        return ResponseEntity.noContent().build();
    }
}
