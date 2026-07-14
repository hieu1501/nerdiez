package com.tmb.csnerd.demo.dto.auth;

public record AuthResponseDTO(
    String tokenType,
    long accessTokenExpiresInSeconds,
    long refreshTokenExpiresInSeconds
) { }
