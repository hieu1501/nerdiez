package com.tmb.csnerd.demo.domain.security;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

@Configuration
@ConfigurationProperties(prefix = "app.auth")
public class AuthProperties {
    @Value("${app.auth.access-token-expire-seconds}")
    @Getter
    private Long accessTokenExpireSeconds;

    @Value("${app.auth.refresh-token-expire-days}")
    @Getter
    private Long refreshTokenExpireDays;

    @Value("${app.auth.access-token-name}")
    @Getter
    private String accessTokenName;

    @Value("${app.auth.refresh-token-name}")
    @Getter
    private String refreshTokenName;

    @Value("${app.auth.admin-emails:}")
    private String adminEmails;

    public Long getRefreshTokenExpireSeconds() {
        return refreshTokenExpireDays * 24 * 60 * 60;
    }

    // Emails granted the ADMIN role on first login, instead of the default USER role.
    public Set<String> getAdminEmails() {
        return Arrays.stream(adminEmails.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .map(String::toLowerCase)
                .collect(Collectors.toSet());
    }
}
