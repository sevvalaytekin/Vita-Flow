package com.vitaflow.identity.service;

import com.vitaflow.common.exception.AppException;
import com.vitaflow.common.exception.ErrorCode;
import com.vitaflow.common.util.PasswordUtil;
import com.vitaflow.identity.domain.Role;
import com.vitaflow.identity.domain.User;
import com.vitaflow.identity.payload.request.RegisterRequest;
import com.vitaflow.identity.payload.response.UserResponse;
import com.vitaflow.identity.repository.RoleRepository;
import com.vitaflow.identity.repository.TenantRepository;
import com.vitaflow.identity.repository.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class IdentityService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final TenantRepository tenantRepository;
    private final PasswordUtil passwordUtil;

    public IdentityService(
            UserRepository userRepository,
            RoleRepository roleRepository,
            TenantRepository tenantRepository,
            PasswordUtil passwordUtil
    ) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.tenantRepository = tenantRepository;
        this.passwordUtil = passwordUtil;
    }

    @Transactional
    public UserResponse register(RegisterRequest req) {

        String email = req.email().trim().toLowerCase();
        String tenantCode = req.tenantCode().trim().toUpperCase();

        // 🔴 duplicate email kontrol
        if (userRepository.existsByTenant_CodeAndEmailIgnoreCase(tenantCode, email)) {
            throw new AppException(
                    ErrorCode.INVALID_REQUEST,
                    "Bu e-posta adresi zaten kayıtlı"
            );
        }

        // 🔴 phone sanitize & duplicate kontrol
        String phone = req.phone() != null ? req.phone().replaceAll("[^0-9]", "") : "";
        if (phone.length() > 11) {
            phone = phone.substring(phone.length() - 11);
        }
        if (!phone.isEmpty() && userRepository.existsByPhone(phone)) {
            throw new AppException(
                    ErrorCode.INVALID_REQUEST,
                    "Bu telefon numarası zaten kayıtlı"
            );
        }

        // 🔴 tenant bul
        var tenant = tenantRepository.findByCode(tenantCode)
                .orElseThrow(() -> new AppException(
                        ErrorCode.INTERNAL_ERROR,
                        "Tenant not found"
                ));

        // 🔴 user oluştur
        User user = User.create(
                email,
                req.username(),
                passwordUtil.encode(req.password()),
                tenant,
                phone.isEmpty() ? null : phone
        );

        // 🔴 default role
        Role role = roleRepository.findByCode("ROLE_USER")
                .orElseThrow(() -> new AppException(
                        ErrorCode.INTERNAL_ERROR,
                        "Default role missing"
                ));

        user.addRole(role);

        try {
            userRepository.save(user);
        } catch (Exception e) {
            String msg = e.getMessage() != null ? e.getMessage().toLowerCase() : "";
            if (msg.contains("phone")) {
                throw new AppException(ErrorCode.INVALID_REQUEST, "Bu telefon numarası zaten kayıtlı");
            }
            if (msg.contains("email")) {
                throw new AppException(ErrorCode.INVALID_REQUEST, "Bu e-posta adresi zaten kayıtlı");
            }
            if (msg.contains("username")) {
                throw new AppException(ErrorCode.INVALID_REQUEST, "Bu kullanıcı adı zaten kayıtlı");
            }
            throw new AppException(ErrorCode.INTERNAL_ERROR, "Kayıt sırasında bir hata oluştu");
        }

        return new UserResponse(
                user.getId().toString(),
                user.getEmail(),
                user.getUsername()
        );
    }
}