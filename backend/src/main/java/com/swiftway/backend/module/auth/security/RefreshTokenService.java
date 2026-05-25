package com.swiftway.backend.module.auth.security;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private static final String PREFIX = "refresh:";

    private final StringRedisTemplate redis;

    @Value("${app.jwt.refresh-token-ttl-seconds:604800}")  // 7 days
    private long refreshTtlSeconds;

    public String create(String email) {
        String token = UUID.randomUUID().toString();
        redis.opsForValue().set(PREFIX + token, email, Duration.ofSeconds(refreshTtlSeconds));
        return token;
    }


    public String validate(String token) {
        String email = redis.opsForValue().get(PREFIX + token);
        if (email == null) {
            throw new IllegalArgumentException("Refresh token inválido ou expirado.");
        }
        return email;
    }

    public void revoke(String token) {
        redis.delete(PREFIX + token);
    }

    public String rotate(String oldToken) {
        String email = validate(oldToken);  // throws if invalid
        revoke(oldToken);
        return create(email);
    }

    public long getRefreshTtlSeconds() {
        return refreshTtlSeconds;
    }
}

