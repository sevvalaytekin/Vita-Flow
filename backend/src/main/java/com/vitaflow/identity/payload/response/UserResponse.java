package com.vitaflow.identity.payload.response;

public record UserResponse(
        String id,
        String email,
        String username
) {
}