package com.vitaflow.common.exception;

import com.vitaflow.common.api.ErrorResponse;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

import jakarta.validation.ConstraintViolationException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // 🔥 BUSINESS EXCEPTION
    @ExceptionHandler(AppException.class)
    public ResponseEntity<ErrorResponse> handleApp(AppException ex) {

        HttpStatus status = mapStatus(ex.getErrorCode());

        return ResponseEntity
                .status(status)
                .body(ErrorResponse.of(
                        ex.getErrorCode().name(),
                        ex.getMessage() // ❗ SAFE MESSAGE
                ));
    }

    // 🔥 DTO VALIDATION (RequestBody)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {

        Map<String, String> errors = new HashMap<>();

        for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
            errors.put(fieldError.getField(), "Invalid value");
        }

        return ResponseEntity
                .badRequest()
                .body(ErrorResponse.of(
                        ErrorCode.VALIDATION_ERROR.name(),
                        "Invalid request",
                        errors
                ));
    }

    // 🔥 PARAM / PATH VALIDATION
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResponse> handleConstraint(ConstraintViolationException ex) {

        return ResponseEntity
                .badRequest()
                .body(ErrorResponse.of(
                        ErrorCode.VALIDATION_ERROR.name(),
                        "Invalid request"
                ));
    }

    // 🔥 DATABASE CONSTRAINT VIOLATIONS (duplicate keys, etc.)
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleDataIntegrity(DataIntegrityViolationException ex) {

        String msg = ex.getMostSpecificCause().getMessage().toLowerCase();
        String userMessage;

        if (msg.contains("phone")) {
            userMessage = "Bu telefon numarası zaten kayıtlı";
        } else if (msg.contains("email")) {
            userMessage = "Bu e-posta adresi zaten kayıtlı";
        } else if (msg.contains("username")) {
            userMessage = "Bu kullanıcı adı zaten kayıtlı";
        } else {
            userMessage = "Bu bilgilerle zaten bir kayıt mevcut";
        }

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ErrorResponse.of(
                        ErrorCode.INVALID_REQUEST.name(),
                        userMessage
                ));
    }

    // 🔥 SPRING SECURITY ACCESS DENIED
    @ExceptionHandler(org.springframework.security.access.AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(Exception ex) {

        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(ErrorResponse.of(
                        ErrorCode.ACCESS_DENIED.name(),
                        "Access denied"
                ));
    }

    // 🔥 FALLBACK (GENERIC)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneric(Exception ex) {

        // ❗ LOGLA ama client'a verme
        ex.printStackTrace();

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ErrorResponse.of(
                        ErrorCode.INTERNAL_ERROR.name(),
                        "Something went wrong"
                ));
    }

    private HttpStatus mapStatus(ErrorCode code) {
        return switch (code) {
            case INVALID_CREDENTIALS -> HttpStatus.UNAUTHORIZED;
            case USER_DISABLED -> HttpStatus.FORBIDDEN;
            case TOKEN_EXPIRED, TOKEN_INVALID -> HttpStatus.UNAUTHORIZED;
            case ACCESS_DENIED -> HttpStatus.FORBIDDEN;
            case VALIDATION_ERROR, INVALID_REQUEST -> HttpStatus.BAD_REQUEST;
            default -> HttpStatus.INTERNAL_SERVER_ERROR;
        };
    }
}