package com.tmb.csnerd.demo.dto.user;

import com.tmb.csnerd.demo.domain.models.User;
import com.tmb.csnerd.demo.domain.security.UserPrincipal;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record UserProfileResponseDTO(
  @NotBlank String username,
  String displayName
) {
    public static UserProfileResponseDTO from(UserPrincipal user) {
        return new UserProfileResponseDTO(user.getUsername(), user.getUsername());
    }
}
