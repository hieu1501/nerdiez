package com.tmb.csnerd.demo.domain.security;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.security.oauth2.server.resource.web.BearerTokenResolver;

public class CookieBearerTokenResolver implements BearerTokenResolver {
    private final AuthProperties authProperties;

    public CookieBearerTokenResolver(AuthProperties authProperties) {
        this.authProperties = authProperties;
    }

    @Override
    public String resolve(HttpServletRequest request) {
        // 1. Try Authorization header first (optional, for API clients)
        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (header != null && header.startsWith("Bearer ")) {
            return header.substring(7);
        }

        // 2. Fall back to HttpOnly cookie
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if (authProperties.getAccessTokenName().equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }
}
