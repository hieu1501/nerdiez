package com.tmb.csnerd.demo.domain.security;

import com.tmb.csnerd.demo.domain.services.auth.AuthService;
import com.tmb.csnerd.demo.domain.services.auth.AuthUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Component
@RequiredArgsConstructor
public class JwtIssuingAuthenticationSuccessHandler implements AuthenticationSuccessHandler {
    private final AuthService authService;
    private final AuthProperties authProperties;
    private static final Logger log = LoggerFactory.getLogger(JwtIssuingAuthenticationSuccessHandler.class);

    @Value("${app.auth.redirect-uri-admin}")
    private String redirectUriForAdmin;
    @Value("${app.auth.redirect-uri-public}")
    private String redirectUriForPublic;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException {
        AuthService.IssuedTokenPair tokens = authService.authenticateUser(authentication);
        AuthUtils.addCookie(response, authProperties.getAccessTokenName(), tokens.accessToken(), authProperties.getAccessTokenExpireSeconds(), "/", false);
        AuthUtils.addCookie(response, authProperties.getRefreshTokenName(), tokens.refreshToken(), authProperties.getRefreshTokenExpireSeconds(), "/api/auth/refresh", false);
        invalidateSession(request, response);
        response.sendRedirect(getRedirectUriFromState(request.getParameter("state")));
    }

    private String getRedirectUriFromState(String state) {
        if (state == null) return redirectUriForPublic;
        String encoded = state.substring(state.indexOf('|') + 1);
        try {
            String key = new String(Base64.getUrlDecoder().decode(encoded), StandardCharsets.UTF_8);
            return switch (key) {
                case "admin" -> redirectUriForAdmin;
                default -> redirectUriForPublic;
            };
        } catch (Exception e) {
            log.error(e.getMessage(), e);
            return redirectUriForPublic;
        }
    }

    private void invalidateSession(HttpServletRequest request, HttpServletResponse response) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        AuthUtils.deleteCookie(response, "JSESSIONID");
    }
}