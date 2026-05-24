package com.vitaflow.admin.controller;

import com.vitaflow.admin.dto.RoleUpdateRequest;
import com.vitaflow.admin.service.AdminService;
import com.vitaflow.common.api.ApiResponse;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {
    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @PutMapping("/users/{userId}/role")
    public ResponseEntity<ApiResponse<?>> updateRole(
            @PathVariable String userId,
            @RequestBody RoleUpdateRequest req,
            Authentication auth
    ) {

        String currentUserId = auth.getName();

        adminService.updateRole(userId, req.role(), currentUserId);

        return ResponseEntity.ok(
                ApiResponse.success(Map.of(
                        "message", "User role updated",
                        "userId", userId,
                        "role", req.role()
                ))
        );
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<?>> listUsers(Authentication auth) {

        String currentUserId = auth.getName();

        return ResponseEntity.ok(
                ApiResponse.success(adminService.listUsers(currentUserId))
        );
    }

    @GetMapping("/ping")
    @PreAuthorize("hasRole('ADMIN')")
    public String ping() {
        return "OK";
    }

    @GetMapping("/user-read")
    @PreAuthorize("hasAuthority('PERM_USER_READ')")
    public String userRead() {
        return "USER READ OK";
    }
}