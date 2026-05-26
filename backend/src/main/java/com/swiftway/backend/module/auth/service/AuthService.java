package com.swiftway.backend.module.auth.service;

import com.swiftway.backend.module.auth.domain.User;
import com.swiftway.backend.module.auth.domain.UserRole;
import com.swiftway.backend.module.auth.dto.AuthDtos.*;
import com.swiftway.backend.module.auth.security.JwtService;
import com.swiftway.backend.module.auth.security.RefreshTokenService;
import com.swiftway.backend.module.carrier.domain.Carrier;
import com.swiftway.backend.module.carrier.repository.CarrierRepository;
import com.swiftway.backend.module.driver.domain.Driver;
import com.swiftway.backend.module.driver.repository.DriverRepository;
import com.swiftway.backend.shared.exception.EmailAlreadyUsedException;
import com.swiftway.backend.shared.exception.InvalidCredentialsException;
import com.swiftway.backend.module.auth.repository.UserRepository;
import com.swiftway.backend.shared.validation.CnpjValidator;
import com.swiftway.backend.shared.validation.CpfValidator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import static com.swiftway.backend.shared.utils.CpfUtils.sanitize;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final DriverRepository driverRepository;
    private final CarrierRepository carrierRepository;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;

    @Transactional
    public TokenResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.email())) {
            throw new EmailAlreadyUsedException(req.email());
        }

        User user = User.builder()
            .email(req.email())
            .password(passwordEncoder.encode(req.password()))
            .role(req.role())
            .build();

        userRepository.save(user);
        log.info("New user registered: {} [{}]", user.getEmail(), user.getRole());

        if (req.role() == UserRole.DRIVER) {
            validateDriverFields(req);

            Driver driver = Driver.builder()
                .user(user)
                .fullName(req.fullName())
                .cpf(sanitize(req.cpf()))
                .phone(req.phone())
                .cnhNumber(req.cnhNumber())
                .cnhCategory(req.cnhCategory())
                .cnhValidity(req.cnhValidity())
                .available(false)
                .grApproved(false)
                .build();

            driverRepository.save(driver);
            log.info("Driver profile created for userId={}", user.getId());

        } else if (req.role() == UserRole.CARRIER) {
            validateCarrierFields(req);

            Carrier carrier = Carrier.builder()
                .user(user)
                .cnpj(req.cnpj().replaceAll("[.\\-/]", ""))
                .razaoSocial(req.razaoSocial())
                .nomeFantasia(req.nomeFantasia())
                .telefone(req.phone())
                .build();

            carrierRepository.save(carrier);
            log.info("Carrier profile created for userId={}", user.getId());
        }

        return issueTokenPair(user);
    }

    @Transactional(readOnly = true)
    public TokenResponse login(LoginRequest req) {
        User user = userRepository.findByEmail(req.email())
            .orElseThrow(InvalidCredentialsException::new);

        if (!passwordEncoder.matches(req.password(), user.getPassword())) {
            throw new InvalidCredentialsException();
        }

        if (!user.isEnabled()) {
            throw new InvalidCredentialsException("Conta inativa.");
        }

        log.info("Login OK: {}", user.getEmail());
        return issueTokenPair(user);
    }

    @Transactional(readOnly = true)
    public TokenResponse refresh(RefreshRequest req) {
        String newRefreshToken = refreshTokenService.rotate(req.refreshToken());

        String email = refreshTokenService.validate(newRefreshToken);
        User user = userRepository.findByEmail(email)
            .orElseThrow(InvalidCredentialsException::new);

        String newAccessToken = jwtService.generateAccessToken(user);
        log.info("Tokens rotated for: {}", email);

        return TokenResponse.of(newAccessToken, newRefreshToken,
            jwtService.getAccessTokenTtlSeconds());
    }

    public void logout(LogoutRequest req) {
        refreshTokenService.revoke(req.refreshToken());
        log.info("Refresh token revoked.");
    }

    // ── helpers ───────────────────────────────────────────────────

    private void validateDriverFields(RegisterRequest req) {
        if (req.fullName() == null || req.cpf() == null || req.cnhNumber() == null
            || req.cnhCategory() == null || req.cnhValidity() == null) {
            throw new IllegalArgumentException(
                "Campos obrigatórios para motorista: fullName, cpf, cnhNumber, cnhCategory, cnhValidity");
        }
        assertCpf(req.cpf());
    }

    private void validateCarrierFields(RegisterRequest req) {
        if (req.razaoSocial() == null || req.cnpj() == null) {
            throw new IllegalArgumentException(
                "Campos obrigatórios para transportadora: razaoSocial, cnpj");
        }
        assertCnpj(req.cnpj());
    }

    private void assertCpf(String cpf) {
        if (!new CpfValidator().isValid(cpf, null)) {
            throw new IllegalArgumentException("CPF inválido: " + cpf);
        }
    }

    private void assertCnpj(String cnpj) {
        if (!new CnpjValidator().isValid(cnpj, null)) {
            throw new IllegalArgumentException("CNPJ inválido: " + cnpj);
        }
    }

    private TokenResponse issueTokenPair(User user) {
        String accessToken  = jwtService.generateAccessToken(user);
        String refreshToken = refreshTokenService.create(user.getEmail());
        return TokenResponse.of(accessToken, refreshToken,
            jwtService.getAccessTokenTtlSeconds());
    }
}
