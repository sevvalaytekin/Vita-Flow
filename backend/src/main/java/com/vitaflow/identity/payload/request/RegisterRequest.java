package com.vitaflow.identity.payload.request;

public record RegisterRequest(
        String tenantCode,
        String username,
        String email,
        String password,
        String phone
) {
}