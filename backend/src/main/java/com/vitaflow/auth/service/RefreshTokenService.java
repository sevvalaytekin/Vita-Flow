package com.vitaflow.auth.service;

import com.vitaflow.audit.service.AuditService;
import com.vitaflow.auth.domain.RefreshToken;
import com.vitaflow.auth.repository.RefreshTokenRepository;
import com.vitaflow.common.exception.AppException;
import com.vitaflow.common.exception.ErrorCode;
import com.vitaflow.common.util.TokenHashUtil;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.InetAddress;
import java.time.OffsetDateTime;

@Service
public class RefreshTokenService {

    private final RefreshTokenRepository repository;
    private final TokenHashUtil hashUtil;
    private final TokenService tokenService;
    private final AuditService auditService;

    public RefreshTokenService(
            RefreshTokenRepository repository,
            TokenHashUtil hashUtil,
            TokenService tokenService, AuditService auditService
    ) {
        this.repository = repository;
        this.hashUtil = hashUtil;
        this.tokenService = tokenService;
        this.auditService = auditService;
    }

    @Transactional
    public TokenService.TokenPair refresh(
            String rawRefreshToken,
            String deviceId,
            InetAddress ip,
            String userAgent
    ) {
        String hash = hashUtil.hmacSha256(rawRefreshToken);

        RefreshToken existing = repository.findByTokenHashAndDeletedFalse(hash)
                .orElseThrow(() -> new AppException(ErrorCode.TOKEN_INVALID, "Invalid refresh token"));

        if (existing.isRevoked() || existing.isReused()) {
            existing.markReused();
            auditService.securityEvent(
                    existing.getUser().getId(),
                    existing.getTenant().getId(),
                    existing.getUser().getEmail(),
                    "REFRESH_TOKEN_REUSE",
                    ip,
                    userAgent
            );
            repository.revokeAllActiveTokensByUserAndTenant(
                    existing.getUser().getId(),
                    existing.getTenant().getId(),
                    OffsetDateTime.now()
            );

            throw new AppException(ErrorCode.TOKEN_INVALID, "Refresh token reuse detected");
        }

        if (!existing.isActive()) {
            throw new AppException(ErrorCode.TOKEN_EXPIRED, "Refresh token expired");
        }

        TokenService.IssuedTokenPair issued = tokenService.issue(
                existing.getUser(),
                deviceId,
                ip,
                userAgent
        );

        existing.revoke(issued.refreshTokenEntity());

        return issued.tokenPair();
    }

    @Transactional
    public void logout(String rawRefreshToken) {

        String hash = hashUtil.hmacSha256(rawRefreshToken);

        RefreshToken token = repository.findByTokenHashAndDeletedFalse(hash)
                .orElse(null);

        // audit (context varsa doldur)
        auditService.securityEvent(
                token != null ? token.getUser().getId() : null,
                token != null ? token.getTenant().getId() : null,
                token != null ? token.getUser().getEmail() : null,
                "LOGOUT",
                null,
                null
        );

        int updated = repository.revokeByTokenHash(hash, OffsetDateTime.now());

        if (updated == 0) {
            throw new AppException(ErrorCode.TOKEN_INVALID, "Invalid refresh token");
        }
    }
}