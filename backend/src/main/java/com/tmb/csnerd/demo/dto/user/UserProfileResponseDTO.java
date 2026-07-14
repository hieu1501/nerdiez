package com.tmb.csnerd.demo.dto.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record UserProfileResponseDTO(
  @NotBlank String username,
  String displayName
) { }
