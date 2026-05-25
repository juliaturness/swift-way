package com.swiftway.backend.module.auth.service;



import com.swiftway.backend.module.auth.domain.User;
import com.swiftway.backend.module.auth.dto.AuthDtos.*;
import com.swiftway.backend.module.auth.security.JwtService;
import com.swiftway.backend.module.auth.security.RefreshTokenService;
import com.swiftway.backend.shared.exception.EmailAlreadyUsedException;
import com.swiftway.backend.shared.exception.InvalidCredentialsException;
import com.swiftway.backend.module.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
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

    private TokenResponse issueTokenPair(User user) {
        String accessToken  = jwtService.generateAccessToken(user);
        String refreshToken = refreshTokenService.create(user.getEmail());
        return TokenResponse.of(accessToken, refreshToken,
            jwtService.getAccessTokenTtlSeconds());
    }
}

