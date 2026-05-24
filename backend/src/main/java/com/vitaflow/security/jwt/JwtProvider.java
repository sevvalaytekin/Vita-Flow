package com.vitaflow.security.jwt;

import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import com.vitaflow.common.exception.AppException;
import com.vitaflow.common.exception.ErrorCode;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@Component
public class JwtProvider {

    private final byte[] secret;
    private final long accessTokenTtl;

    public JwtProvider(
            @Value("${security.jwt.secret}") String secret,
            @Value("${security.jwt.access-ttl}") long accessTokenTtl
    ) {
        if (secret == null || secret.length() < 32) {
            throw new IllegalStateException("JWT secret must be at least 32 chars");
        }
        this.secret = secret.getBytes();
        this.accessTokenTtl = accessTokenTtl;
    }

    // =========================
    // GENERATE
    // =========================
    public String generateAccessToken(
            UUID userId,
            String tenantCode,
            String email,
            String username,
            List<String> roles,
            List<String> permissions
    ) {
        try {

            Instant now = Instant.now();

            JWTClaimsSet claims = new JWTClaimsSet.Builder()
                    .subject(userId.toString())
                    .claim("tenant", tenantCode)
                    .claim("email", email)
                    .claim("username", username)
                    .claim("roles", roles)
                    .claim("permissions", permissions)
                    .issueTime(Date.from(now))
                    .expirationTime(Date.from(now.plusSeconds(accessTokenTtl)))
                    .jwtID(UUID.randomUUID().toString())
                    .build();

            SignedJWT jwt = new SignedJWT(
                    new JWSHeader(JWSAlgorithm.HS256),
                    claims
            );

            jwt.sign(new MACSigner(secret));

            return jwt.serialize();

        } catch (Exception e) {
            throw new IllegalStateException("JWT creation failed", e);
        }
    }

    // =========================
    // PARSE + VALIDATE
    // =========================
    public JwtPrincipal parseAndValidate(String token) {
        try {

            SignedJWT jwt = SignedJWT.parse(token);

            // signature check
            if (!jwt.verify(new MACVerifier(secret))) {
                throw new AppException(ErrorCode.TOKEN_INVALID, "Invalid signature");
            }

            JWTClaimsSet claims = jwt.getJWTClaimsSet();

            Date exp = claims.getExpirationTime();
            Date now = new Date();

            long skewMillis = 30 * 1000;

            if (exp == null || exp.getTime() + skewMillis < now.getTime()) {
                throw new AppException(ErrorCode.TOKEN_EXPIRED, "Token expired");
            }
            return new JwtPrincipal(
                    UUID.fromString(claims.getSubject()),
                    (String) claims.getClaim("tenant"),
                    (String) claims.getClaim("email"),
                    (String) claims.getClaim("username"),
                    (List<String>) claims.getClaim("roles"),
                    (List<String>) claims.getClaim("permissions")
            );

        } catch (Exception e) {
            throw new AppException(ErrorCode.TOKEN_INVALID, "JWT invalid");
        }
    }

    // =========================
    // PRINCIPAL
    // =========================
    public record JwtPrincipal(
            UUID userId,
            String tenant,
            String email,
            String username,
            List<String> roles,
            List<String> permissions
    ) {
    }
}