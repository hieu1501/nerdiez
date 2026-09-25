package com.tmb.csnerd.demo.domain.services.auth;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.Optional;

@Component
public class AuthUtils {
    public static final String REFRESH_TOKEN_COOKIE_PATH = "/api/auth";

    @Getter
    private static Long accessTokenExpireSeconds;
    @Getter
    private static Long refreshTokenExpireDays;

    @Value("${app.auth.access-token-expire-seconds}")
    public void setAccessTokenExpireSeconds(Long seconds) {
        accessTokenExpireSeconds = seconds;
    }

    @Value("${app.auth.refresh-token-expire-days}")
    public void setRefreshTokenExpireDays(Long days) {
        refreshTokenExpireDays = days;
    }

    public static String extractUsernameFromEmail(String email) {
        return email.split("@")[0];
    }

    public static Optional<Cookie> getCookie(HttpServletRequest request, String name) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (cookie.getName().equals(name)) {
                    return Optional.of(cookie);
                }
            }
        }
        return Optional.empty();
    }

    public static void addCookie(HttpServletResponse response, String name, String value, Long maxAgeInSeconds, String path, boolean sameSiteStrict) {
        ResponseCookie cookie = ResponseCookie.from(name, value)
                .httpOnly(true).secure(true).sameSite(sameSiteStrict ? "Strict" : "Lax").path(path)
                .maxAge(Duration.ofSeconds(maxAgeInSeconds)).build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    public static void deleteCookie(HttpServletResponse response, String name) {
        deleteCookie(response, name, "/");
    }

    public static void deleteCookie(HttpServletResponse response, String name, String path) {
        ResponseCookie cookie = ResponseCookie.from(name, "")
                .httpOnly(true).secure(true).sameSite("Lax")
                .path(path)
                .maxAge(0).build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
}
