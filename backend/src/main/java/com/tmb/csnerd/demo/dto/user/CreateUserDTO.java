package com.tmb.csnerd.demo.dto.user;

import jakarta.validation.constraints.NotBlank;

public record CreateUserDTO(
  @NotBlank String username,
  @NotBlank String pa
) { }
