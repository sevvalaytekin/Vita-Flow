package com.vitaflow.auth.service;

import com.vitaflow.auth.domain.RefreshToken;
import com.vitaflow.auth.repository.RefreshTokenRepository;
import com.vitaflow.common.util.TokenHashUtil;
import com.vitaflow.identity.domain.User;
import com.vitaflow.security.jwt.JwtProvider;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.InetAddress;
import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.util.Base64;
import java.util.List;

@Service
public class TokenService {

    private final JwtProvider jwtProvider;
    private final RefreshTokenRepository refreshTokenRepository;
    private final TokenHashUtil tokenHashUtil;
    private final SecureRandom secureRandom = new SecureRandom();
    private final long refreshTtl;

    public TokenService(
            JwtProvider jwtProvider,
            RefreshTokenRepository refreshTokenRepository,
            TokenHashUtil tokenHashUtil,
            @Value("${security.refresh-token.ttl}") long refreshTtl
    ) {
        this.jwtProvider = jwtProvider;
        this.refreshTokenRepository = refreshTokenRepository;
        this.tokenHashUtil = tokenHashUtil;
        this.refreshTtl = refreshTtl;
    }

    @Transactional
    public IssuedTokenPair issue(User user, String deviceId, InetAddress ip, String userAgent) {
        String accessToken = jwtProvider.generateAccessToken(
                user.getId(),
                user.getTenant().getCode(),
                user.getEmail(),
                user.getUsername(),
                extractRoles(user),
                extractPermissions(user)
        );

        String rawRefreshToken = generateSecureRefreshToken();
        String tokenHash = tokenHashUtil.hmacSha256(rawRefreshToken);

        RefreshToken entity = new RefreshToken(
                user,
                user.getTenant(),
                tokenHash,
                deviceId,
                OffsetDateTime.now().plusSeconds(refreshTtl),
                ip,
                sanitizeUserAgent(userAgent)
        );

        RefreshToken saved = refreshTokenRepository.save(entity);

        return new IssuedTokenPair(
                new TokenPair(accessToken, rawRefreshToken),
                saved
        );
    }

    public TokenPair generate(User user, String deviceId, InetAddress ip, String userAgent) {
        return issue(user, deviceId, ip, userAgent).tokenPair();
    }

    private String generateSecureRefreshToken() {
        byte[] bytes = new byte[64];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String sanitizeUserAgent(String userAgent) {
        if (userAgent == null) {
            return null;
        }
        return userAgent
                .replace("\r", "")
                .replace("\n", "")
                .trim()
                .substring(0, Math.min(userAgent.length(), 500));
    }

    private List<String> extractRoles(User user) {
        return user.getRoles()
                .stream()
                .filter(role -> role.isActive() && !role.isDeleted())
                .map(role -> role.getCode())
                .distinct()
                .toList();
    }

    private List<String> extractPermissions(User user) {
        return user.getRoles()
                .stream()
                .filter(role -> role.isActive() && !role.isDeleted())
                .flatMap(role -> role.getPermissions().stream())
                .filter(permission -> permission.isActive() && !permission.isDeleted())
                .map(permission -> permission.getCode())
                .distinct()
                .toList();
    }

    public record TokenPair(String accessToken, String refreshToken) {
    }

    public record IssuedTokenPair(TokenPair tokenPair, RefreshToken refreshTokenEntity) {
    }
}