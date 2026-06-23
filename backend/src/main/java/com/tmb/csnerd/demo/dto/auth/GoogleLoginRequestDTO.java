package com.tmb.csnerd.demo.dto.auth;

import jakarta.validation.constraints.NotBlank;

public record GoogleLoginRequestDTO(
    @NotBlank String credential
) { }
