package com.vitaflow.auth.service;

import com.vitaflow.audit.service.AuditService;
import com.vitaflow.common.exception.AppException;
import com.vitaflow.common.exception.ErrorCode;
import com.vitaflow.common.util.PasswordUtil;
import com.vitaflow.identity.domain.User;
import com.vitaflow.identity.repository.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.InetAddress;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordUtil passwordUtil;
    private final TokenService tokenService;
    private final AuditService auditService;

    public AuthService(
            UserRepository userRepository,
            PasswordUtil passwordUtil,
            TokenService tokenService,
            AuditService auditService
    ) {
        this.userRepository = userRepository;
        this.passwordUtil = passwordUtil;
        this.tokenService = tokenService;
        this.auditService = auditService;
    }

    @Transactional
    public TokenService.TokenPair login(
            String tenantCode,
            String email,
            String password,
            String deviceId,
            InetAddress ip,
            String userAgent
    ) {
        if (deviceId == null || deviceId.isBlank() || deviceId.length() < 10) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Invalid device");
        }
        if (!deviceId.matches("^[a-zA-Z0-9\\-]+$")) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Invalid device format");
        }
        // 🔴 user lookup
        User user = userRepository
                .findByTenant_CodeAndEmailIgnoreCaseAndDeletedFalse(tenantCode, email)
                .orElseThrow(() -> new AppException(
                        ErrorCode.INVALID_CREDENTIALS,
                        "Invalid credentials"
                ));

        // 🔴 account locked
        if (user.isLocked()) {

            auditService.loginFail(
                    email,
                    "ACCOUNT_LOCKED",
                    ip,
                    userAgent
            );

            throw new AppException(
                    ErrorCode.USER_DISABLED,
                    "Account locked"
            );
        }

        // 🔴 disabled / deleted
        if (!user.isEnabled() || user.isDeleted()) {

            auditService.loginFail(
                    email,
                    "USER_DISABLED",
                    ip,
                    userAgent
            );

            throw new AppException(
                    ErrorCode.USER_DISABLED,
                    "User disabled"
            );
        }

        // 🔴 password check
        if (!passwordUtil.matches(password, user.getPasswordHash())) {

            auditService.loginFail(
                    email,
                    "INVALID_CREDENTIALS",
                    ip,
                    userAgent
            );

            user.markLoginFailure();

            throw new AppException(
                    ErrorCode.INVALID_CREDENTIALS,
                    "Invalid credentials"
            );
        }

        // ✅ success
        user.markLoginSuccess();

        auditService.loginSuccess(
                user.getId(),
                user.getTenant().getId(),
                user.getEmail(),
                ip,
                userAgent
        );

        return tokenService.generate(
                user,
                deviceId,
                ip,
                userAgent
        );
    }
}