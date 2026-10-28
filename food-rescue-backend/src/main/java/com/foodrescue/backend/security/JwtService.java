package com.foodrescue.backend.security;

import com.foodrescue.backend.model.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;

/**
 * Creates and checks the signed tokens returned by login.
 */
@Service
public class JwtService {

    private static final String DEV_SECRET_PREFIX = "dev-only-secret";

    private final String secret;
    private final long expirationMinutes;
    private final Environment environment;
    private SecretKey key;

    public JwtService(@Value("${app.jwt.secret}") String secret,
                      @Value("${app.jwt.expiration-minutes}") long expirationMinutes,
                      Environment environment) {
        this.secret = secret;
        this.expirationMinutes = expirationMinutes;
        this.environment = environment;
    }

    @PostConstruct
    void init() {
        if (secret.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalStateException("app.jwt.secret must be at least 32 characters long");
        }
        if (environment.acceptsProfiles(Profiles.of("prod")) && secret.startsWith(DEV_SECRET_PREFIX)) {
            throw new IllegalStateException("Set the JWT_SECRET environment variable before running with the prod profile");
        }
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String createToken(User user) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(String.valueOf(user.getId()))
                .claim("email", user.getEmail())
                .claim("role", user.getRole().name())
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(Duration.ofMinutes(expirationMinutes))))
                .signWith(key)
                .compact();
    }

    /** Throws a JwtException if the token is invalid, tampered with or expired. */
    public Claims parse(String token) {
        return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
    }

    public long getExpiresInSeconds() {
        return expirationMinutes * 60;
    }
}
