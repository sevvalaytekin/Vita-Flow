package com.vitaflow.auth.controller;

import com.vitaflow.auth.payload.request.LoginRequest;
import com.vitaflow.auth.payload.request.RefreshRequest;
import com.vitaflow.auth.payload.response.AuthResponse;
import com.vitaflow.auth.service.AuthService;
import com.vitaflow.auth.service.RefreshTokenService;
import com.vitaflow.auth.service.TokenService;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.InetAddress;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;
    private final RefreshTokenService refreshTokenService;

    public AuthController(
            AuthService authService,
            RefreshTokenService refreshTokenService
    ) {
        this.authService = authService;
        this.refreshTokenService = refreshTokenService;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest
    ) throws Exception {

        TokenService.TokenPair tokens = authService.login(
                normalizeTenant(request.tenantCode()),
                request.email(),
                request.password(),
                request.deviceId(),
                resolveClientIp(httpRequest),
                httpRequest.getHeader("User-Agent")
        );

        return ResponseEntity.ok(
                AuthResponse.bearer(tokens.accessToken(), tokens.refreshToken())
        );
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(
            @Valid @RequestBody RefreshRequest request,
            HttpServletRequest httpRequest
    ) throws Exception {

        TokenService.TokenPair tokens = refreshTokenService.refresh(
                request.refreshToken(),
                request.deviceId(),
                resolveClientIp(httpRequest),
                httpRequest.getHeader("User-Agent")
        );

        return ResponseEntity.ok(
                AuthResponse.bearer(tokens.accessToken(), tokens.refreshToken())
        );
    }

    private String normalizeTenant(String tenantCode) {
        return tenantCode == null ? null : tenantCode.trim().toUpperCase();
    }

    private InetAddress resolveClientIp(HttpServletRequest request) throws Exception {
        String forwardedFor = request.getHeader("X-Forwarded-For");

        String ip = forwardedFor != null && !forwardedFor.isBlank()
                ? forwardedFor.split(",")[0].trim()
                : request.getRemoteAddr();

        return InetAddress.getByName(ip);
    }

    @PostMapping(
            value = "/logout",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<Void> logout(@Valid @RequestBody com.witaflow.auth.payload.request.LogoutRequest req) {

        refreshTokenService.logout(req.refreshToken());

        return ResponseEntity.noContent().build();
    }

}