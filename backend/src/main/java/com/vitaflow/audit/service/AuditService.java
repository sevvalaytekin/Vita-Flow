package com.vitaflow.audit.service;

import com.vitaflow.audit.model.LoginAudit;
import com.vitaflow.audit.repository.LoginAuditRepository;

import org.springframework.stereotype.Service;

import java.net.InetAddress;
import java.util.UUID;

@Service
public class AuditService {

    private final LoginAuditRepository repository;

    public AuditService(LoginAuditRepository repository) {
        this.repository = repository;
    }

    public void loginSuccess(UUID userId, UUID tenantId, String email,
                             InetAddress ip, String ua) {

        repository.save(new LoginAudit(
                userId, tenantId, email,
                true, null, ip, ua
        ));
    }

    public void loginFail(String email, String reason,
                          InetAddress ip, String ua) {

        repository.save(new LoginAudit(
                null, null, email,
                false, reason, ip, ua
        ));
    }

    public void securityEvent(UUID userId, UUID tenantId, String email,
                              String reason, InetAddress ip, String ua) {

        repository.save(new LoginAudit(
                userId, tenantId, email,
                false, reason, ip, ua
        ));
    }
}