package com.vitaflow.auth.domain;

import com.vitaflow.identity.domain.Tenant;
import com.vitaflow.identity.domain.User;

import java.net.InetAddress;
import java.time.OffsetDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "refresh_tokens", schema = "auth")
public class RefreshToken {


    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @Column(name = "token_hash", nullable = false, unique = true, length = 255)
    private String tokenHash;

    @Column(name = "device_id", length = 120)
    private String deviceId;

    @Column(nullable = false)
    private boolean revoked = false;

    @Column(nullable = false)
    private boolean reused = false;

    @Column(name = "expires_at", nullable = false)
    private OffsetDateTime expiresAt;

    @Column(name = "revoked_at")
    private OffsetDateTime revokedAt;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "replaced_by_id")
    private RefreshToken replacedBy;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "created_ip")
    private InetAddress createdIp;


    @Column(name = "user_agent")
    private String userAgent;

    @Column(nullable = false)
    private boolean deleted = false;

    @Column(name = "deleted_at")
    private OffsetDateTime deletedAt;

    protected RefreshToken() {
        InetAddress createdIp;
    }

    public RefreshToken(
            User user,
            Tenant tenant,
            String tokenHash,
            String deviceId,
            OffsetDateTime expiresAt,
            InetAddress createdIp,
            String userAgent
    ) {
        this.user = user;
        this.tenant = tenant;
        this.tokenHash = tokenHash;
        this.deviceId = deviceId;
        this.expiresAt = expiresAt;
        this.createdIp = createdIp;
        this.userAgent = userAgent;
        this.createdAt = OffsetDateTime.now();
    }

    public RefreshToken(User user, Tenant tenant, String hash, String deviceId, OffsetDateTime expiresAt, String ip, String userAgent) {
    }

    public UUID getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public Tenant getTenant() {
        return tenant;
    }

    public String getTokenHash() {
        return tokenHash;
    }

    public boolean isRevoked() {
        return revoked;
    }

    public boolean isReused() {
        return reused;
    }

    public boolean isDeleted() {
        return deleted;
    }

    public OffsetDateTime getExpiresAt() {
        return expiresAt;
    }

    public boolean isExpired() {
        return OffsetDateTime.now().isAfter(expiresAt);
    }

    public boolean isActive() {
        return !revoked && !reused && !deleted && !isExpired();
    }

    public void revoke(RefreshToken replacedBy) {
        this.revoked = true;
        this.revokedAt = OffsetDateTime.now();
        this.replacedBy = replacedBy;
    }

    public void markReused() {
        this.reused = true;
        this.revoked = true;
        this.revokedAt = OffsetDateTime.now();
    }
}