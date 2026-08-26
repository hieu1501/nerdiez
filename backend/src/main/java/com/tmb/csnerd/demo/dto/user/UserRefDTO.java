package com.tmb.csnerd.demo.dto.user;

import com.tmb.csnerd.demo.domain.models.User;

public record UserRefDTO(
    String username
) {
    public static UserRefDTO from(User user) {
        return new UserRefDTO(user.getUsername());
    }

    public static UserRefDTO from(String username) {
        return new UserRefDTO(username);
    }

    public String getFingerprint() {
        return "user:" + "username=" + username;
    }
}
