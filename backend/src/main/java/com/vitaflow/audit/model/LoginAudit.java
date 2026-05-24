package com.vitaflow.audit.model;

import java.net.InetAddress;
import java.time.OffsetDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "login_audit", schema = "auth")
public class LoginAudit {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "tenant_id")
    private UUID tenantId;

    @Column(length = 180)
    private String email;

    @Column(nullable = false)
    private boolean success;

    @Column(length = 255)
    private String reason;

    @Column(name = "ip_address")
    private InetAddress ipAddress;

    @Column(name = "user_agent")
    private String userAgent;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    protected LoginAudit() {
    }

    public LoginAudit(UUID userId, UUID tenantId, String email,
                      boolean success, String reason,
                      InetAddress ipAddress, String userAgent) {
        this.userId = userId;
        this.tenantId = tenantId;
        this.email = email;
        this.success = success;
        this.reason = reason;
        this.ipAddress = ipAddress;
        this.userAgent = userAgent;
        this.createdAt = OffsetDateTime.now();
    }
}