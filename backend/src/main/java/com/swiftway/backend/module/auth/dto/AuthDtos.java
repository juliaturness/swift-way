package com.swiftway.backend.module.auth.dto;

import com.swiftway.backend.module.auth.domain.UserRole;
import com.swiftway.backend.shared.validation.ValidCNPJ;
import com.swiftway.backend.shared.validation.ValidCPF;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public final class AuthDtos {

    private AuthDtos() {}

    // Registro Genérico
    public record RegisterRequest(
        @NotBlank @Email String email,
        @NotBlank String password,
        @NotNull UserRole role,

        // DRIVER
        String fullName,
        String cpf,
        String phone,
        String cnhNumber,
        String cnhCategory,
        LocalDate cnhValidity,

        // CARRIER
        String cnpj,
        String razaoSocial,
        String nomeFantasia
    ) {}


    public record LoginRequest(
        @Email @NotBlank String email,
        @NotBlank        String password
    ) {}

    public record TokenResponse(
        String accessToken,
        String refreshToken,
        String tokenType,
        long   expiresIn   // seconds
    ) {
        public static TokenResponse of(String access, String refresh, long ttlSeconds) {
            return new TokenResponse(access, refresh, "Bearer", ttlSeconds);
        }
    }

    public record RefreshRequest(
        @NotBlank String refreshToken
    ) {}

    public record LogoutRequest(
        @NotBlank String refreshToken
    ) {}
}
