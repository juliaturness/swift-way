package com.swiftway.backend.module.auth.controller;


import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/example")
@Tag(name = "Example — @PreAuthorize", description = "Demonstração de controle de acesso por role")
@SecurityRequirement(name = "bearerAuth")
public class ExampleRoleController {

    @GetMapping("/carrier-only")
    @PreAuthorize("hasRole('CARRIER')")
    @Operation(summary = "Endpoint exclusivo para CARRIER")
    public ResponseEntity<Map<String, String>> carrierOnly(
        @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(Map.of(
            "message", "Olá, transportadora!",
            "email",   user.getUsername()
        ));
    }

    @GetMapping("/driver-only")
    @PreAuthorize("hasRole('DRIVER')")
    @Operation(summary = "Endpoint exclusivo para DRIVER")
    public ResponseEntity<Map<String, String>> driverOnly(
        @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(Map.of(
            "message", "Olá, motorista!",
            "email",   user.getUsername()
        ));
    }

    @GetMapping("/admin-only")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Endpoint exclusivo para ADMIN")
    public ResponseEntity<Map<String, String>> adminOnly(
        @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(Map.of(
            "message", "Olá, administrador!",
            "email",   user.getUsername()
        ));
    }

    @GetMapping("/carrier-or-admin")
    @PreAuthorize("hasAnyRole('CARRIER', 'ADMIN')")
    @Operation(summary = "Endpoint para CARRIER ou ADMIN")
    public ResponseEntity<Map<String, String>> carrierOrAdmin() {
        return ResponseEntity.ok(Map.of("message", "Acesso permitido para CARRIER ou ADMIN."));
    }

    @GetMapping("/any-authenticated")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Endpoint para qualquer usuário autenticado")
    public ResponseEntity<Map<String, String>> anyAuthenticated(
        @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(Map.of(
            "message", "Você está autenticado!",
            "email",   user.getUsername(),
            "roles",   user.getAuthorities().toString()
        ));
    }
}

