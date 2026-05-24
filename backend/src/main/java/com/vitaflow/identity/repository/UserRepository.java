package com.vitaflow.identity.repository;

import com.vitaflow.identity.domain.User;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByTenant_CodeAndEmailIgnoreCaseAndDeletedFalse(String tenantCode, String email);

    boolean existsByTenant_CodeAndEmailIgnoreCase(String tenantCode, String email);

    boolean existsByPhone(String phone);

    List<User> findByTenant_Id(UUID tenantId);
}