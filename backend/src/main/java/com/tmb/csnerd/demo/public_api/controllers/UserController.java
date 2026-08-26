package com.tmb.csnerd.demo.public_api.controllers;

import com.tmb.csnerd.demo.domain.security.UserPrincipal;
import com.tmb.csnerd.demo.domain.services.auth.UserPrincipalService;
import com.tmb.csnerd.demo.dto.user.UserProfileResponseDTO;
import com.tmb.csnerd.demo.exceptions.user.UserNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RestController
@RequestMapping("api/profile")
public class UserController {
    private final UserPrincipalService userPrincipalService;

    @GetMapping(path="/me")
    public ResponseEntity<UserProfileResponseDTO> getCurrentUser(@AuthenticationPrincipal Jwt jwt) {
        UserPrincipal userPrincipal = userPrincipalService.getUserBySubject(jwt.getSubject())
                .orElseThrow(() -> new UserNotFoundException(jwt.getSubject()));
        UserProfileResponseDTO body = UserProfileResponseDTO.from(userPrincipal);
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .body(body);
    }
}
