package com.vitaflow.admin.service;

import com.vitaflow.identity.domain.Role;
import com.vitaflow.identity.domain.User;
import com.vitaflow.identity.repository.RoleRepository;
import com.vitaflow.identity.repository.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    public AdminService(UserRepository userRepository,
                        RoleRepository roleRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }

    @Transactional
    public void updateRole(String targetUserId, String roleCode, String currentUserId) {

        User currentUser = userRepository.findById(UUID.fromString(currentUserId))
                .orElseThrow(() -> new RuntimeException("Current user not found"));

        User targetUser = userRepository.findById(UUID.fromString(targetUserId))
                .orElseThrow(() -> new RuntimeException("Target user not found"));

        if (!currentUser.getTenant().getId().equals(targetUser.getTenant().getId())) {
            throw new RuntimeException("Cross-tenant forbidden");
        }

        if (currentUserId.equals(targetUserId)) {
            throw new RuntimeException("Cannot change own role");
        }

        Role role = roleRepository.findByCode(roleCode)
                .orElseThrow(() -> new RuntimeException("Role not found"));

        targetUser.getRoles().clear();
        targetUser.addRole(role);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listUsers(String currentUserId) {

        User currentUser = userRepository.findById(UUID.fromString(currentUserId))
                .orElseThrow(() -> new RuntimeException("Current user not found"));

        return userRepository.findByTenant_Id(currentUser.getTenant().getId())
                .stream()
                .map(u -> Map.of(
                        "userId", u.getId().toString(),
                        "email", u.getEmail(),
                        "username", u.getUsername(),
                        "roles", u.getRoles().stream().map(r -> r.getCode()).toList()
                ))
                .toList();
    }
}