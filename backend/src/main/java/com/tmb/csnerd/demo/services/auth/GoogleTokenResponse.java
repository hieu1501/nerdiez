package com.tmb.csnerd.demo.services.auth;

public record GoogleTokenResponse(
        String accessToken,
        String refreshToken
) {
}
