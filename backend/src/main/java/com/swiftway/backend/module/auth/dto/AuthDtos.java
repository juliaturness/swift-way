package com.swiftway.backend.module.auth.dto;


import com.swiftway.backend.module.auth.domain.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public final class AuthDtos {

    private AuthDtos() {}

    public record RegisterRequest(
        @Email(message = "E-mail inválido")
        @NotBlank
        String email,

        @NotBlank
        @Size(min = 8, message = "Senha deve ter ao menos 8 caracteres")
        String password,

        @NotNull
        UserRole role
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

