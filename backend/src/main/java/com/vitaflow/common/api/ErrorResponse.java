package com.vitaflow.common.api;

import java.time.OffsetDateTime;
import java.util.Map;

public record ErrorResponse(
        String code,
        String message,
        Map<String, String> errors,
        OffsetDateTime timestamp
) {

    // 🔥 simple error
    public static ErrorResponse of(String code, String message) {
        return new ErrorResponse(
                code,
                message,
                null,
                OffsetDateTime.now()
        );
    }

    // 🔥 validation error (field bazlı)
    public static ErrorResponse of(String code, String message, Map<String, String> errors) {
        return new ErrorResponse(
                code,
                message,
                errors,
                OffsetDateTime.now()
        );
    }
}