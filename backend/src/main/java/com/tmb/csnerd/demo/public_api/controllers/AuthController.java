package com.tmb.csnerd.demo.public_api.controllers;

import com.tmb.csnerd.demo.domain.security.AuthProperties;
import com.tmb.csnerd.demo.domain.services.auth.AuthService;
import com.tmb.csnerd.demo.exceptions.auth.InvalidTokenException;
import com.tmb.csnerd.demo.utils.AuthUtils;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/auth")
public class AuthController {
    private final AuthService authService;
    private final AuthProperties authProperties;

    @PostMapping("/refresh")
    public ResponseEntity<Void> refreshToken(HttpServletRequest request, HttpServletResponse response) {
        if (request.getCookies() != null) {
            Cookie refreshTokenCookie = Arrays.stream(request.getCookies())
                    .filter(cookie -> cookie.getName().equals(authProperties.getRefreshTokenName()))
                    .findFirst()
                    .orElseThrow(InvalidTokenException::new);
            String rawRefreshTokenValue = refreshTokenCookie.getValue();
            AuthService.IssuedTokenPair newTokenPair = authService.refreshAccessToken(rawRefreshTokenValue);
            AuthUtils.addCookie(response, authProperties.getAccessTokenName(), newTokenPair.accessToken(), authProperties.getAccessTokenExpireSeconds(), "/", false);
            AuthUtils.addCookie(response, authProperties.getRefreshTokenName(), newTokenPair.refreshToken(), authProperties.getRefreshTokenExpireSeconds(), "/api/auth/refresh", false);
            return ResponseEntity.ok().build();
        }
        else
        {
            throw new InvalidTokenException();
        }
    }
}
