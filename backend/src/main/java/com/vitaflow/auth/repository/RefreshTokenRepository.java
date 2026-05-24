package com.vitaflow.auth.repository;

import com.vitaflow.auth.domain.RefreshToken;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {

    Optional<RefreshToken> findByTokenHashAndDeletedFalse(String tokenHash);

    @Modifying
    @Query("""
            update RefreshToken rt
               set rt.revoked = true,
                   rt.revokedAt = :revokedAt
             where rt.user.id = :userId
               and rt.tenant.id = :tenantId
               and rt.revoked = false
               and rt.deleted = false
            """)
    int revokeAllActiveTokensByUserAndTenant(
            UUID userId,
            UUID tenantId,
            OffsetDateTime revokedAt
    );

    @Modifying
    @Query("""
            update RefreshToken rt
               set rt.revoked = true,
                   rt.revokedAt = :now
             where rt.tokenHash = :hash
               and rt.deleted = false
            """)
    int revokeByTokenHash(String hash, OffsetDateTime now);
}