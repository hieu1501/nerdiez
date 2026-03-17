package com.tmb.csnerd.demo.dto.auth;

public record AuthResponseDTO(
        String accessToken,
        String tokenType,
        long expiresInSeconds
) {
}
