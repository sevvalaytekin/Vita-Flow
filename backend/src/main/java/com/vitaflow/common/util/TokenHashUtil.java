package com.vitaflow.common.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.util.HexFormat;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

@Component
public class TokenHashUtil {

    private static final String HMAC_ALGORITHM = "HmacSHA256";

    private final byte[] secret;

    public TokenHashUtil(
            @Value("${security.refresh-token.hash-secret}") String hashSecret
    ) {
        if (hashSecret == null || hashSecret.length() < 32) {
            throw new IllegalStateException("Refresh token hash secret must be at least 32 characters.");
        }
        this.secret = hashSecret.getBytes(StandardCharsets.UTF_8);
    }

    public String hmacSha256(String rawToken) {
        try {
            Mac mac = Mac.getInstance(HMAC_ALGORITHM);
            mac.init(new SecretKeySpec(secret, HMAC_ALGORITHM));
            byte[] digest = mac.doFinal(rawToken.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (Exception ex) {
            throw new IllegalStateException("Could not hash refresh token.", ex);
        }
    }
}