package com.vitaflow.audit.repository;

import com.vitaflow.audit.model.LoginAudit;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface LoginAuditRepository extends JpaRepository<LoginAudit, UUID> {
}