package com.vitaflow.auth.controller;

import com.vitaflow.common.api.ApiResponse;
import com.vitaflow.common.exception.AppException;
import com.vitaflow.common.exception.ErrorCode;
import com.vitaflow.security.jwt.JwtProvider;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/test")
public class TestController {

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<?>> me(Authentication auth) {

        if (!(auth.getPrincipal() instanceof JwtProvider.JwtPrincipal user)) {
            throw new AppException(ErrorCode.ACCESS_DENIED, "Unauthorized");
        }

        return ResponseEntity.ok(
                ApiResponse.success(
                        Map.of(
                                "userId", user.userId(),
                                "email", user.email(),
                                "tenant", user.tenant()
                        )
                )
        );
    }
}