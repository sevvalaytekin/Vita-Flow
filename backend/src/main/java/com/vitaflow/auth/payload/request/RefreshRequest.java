package com.vitaflow.auth.payload.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RefreshRequest(

        @NotBlank
        @Size(max = 512)
        String refreshToken,

        @Size(max = 120)
        String deviceId
) {
}