package com.tmb.csnerd.demo.domain.security;

import com.tmb.csnerd.demo.domain.services.auth.AuthService;
import com.tmb.csnerd.demo.domain.services.auth.AuthUtils;
import com.tmb.csnerd.demo.exceptions.UnauthorizedException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NonNull;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.net.URI;

@Component
@RequiredArgsConstructor
public class JwtIssuingAuthenticationSuccessHandler implements AuthenticationSuccessHandler {
    private final AuthService authService;
    private final AuthProperties authProperties;

    @Value("${app.auth.redirect-uri-admin}")
    private String redirectUriForAdmin;
    @Value("${app.auth.redirect-uri-public}")
    private String redirectUriForPublic;

    @Override
    public void onAuthenticationSuccess(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull Authentication authentication) throws IOException {
        boolean isAdmin = isAdminHost(request);
        AuthService.IssuedTokenPair tokens;
        try {
            tokens = isAdmin ? authService.authenticateAdmin(authentication) : authService.authenticateUser(authentication);
        } catch (UnauthorizedException e) {
            invalidateSession(request, response);
            response.sendRedirect(UriComponentsBuilder.fromUriString(redirectUriForAdmin)
                    .replacePath("/forbidden").build().toUriString());
            return;
        }
        AuthUtils.addCookie(response, authProperties.getAccessTokenName(), tokens.accessToken(), authProperties.getAccessTokenExpireSeconds(), "/", false);
        AuthUtils.addCookie(response, authProperties.getRefreshTokenName(), tokens.refreshToken(), authProperties.getRefreshTokenExpireSeconds(), AuthUtils.REFRESH_TOKEN_COOKIE_PATH, false);
        invalidateSession(request, response);
        response.sendRedirect(isAdmin ? redirectUriForAdmin : redirectUriForPublic);
    }

    // The OAuth callback lands on the host that started the login (host comes from X-Forwarded-Host).
    private boolean isAdminHost(HttpServletRequest request) {
        return request.getServerName().equalsIgnoreCase(URI.create(redirectUriForAdmin).getHost());
    }

    private void invalidateSession(HttpServletRequest request, HttpServletResponse response) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        AuthUtils.deleteCookie(response, "JSESSIONID");
    }
}