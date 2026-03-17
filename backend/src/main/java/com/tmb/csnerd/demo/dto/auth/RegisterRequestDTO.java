package com.tmb.csnerd.demo.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequestDTO(
        @NotBlank String username,
        @NotBlank String password
) {
}
