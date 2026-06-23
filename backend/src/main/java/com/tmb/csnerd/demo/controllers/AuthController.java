package com.tmb.csnerd.demo.controllers;

import com.tmb.csnerd.demo.dto.auth.AuthResponseDTO;
import com.tmb.csnerd.demo.dto.auth.LoginRequestDTO;
import com.tmb.csnerd.demo.dto.auth.RegisterRequestDTO;
import com.tmb.csnerd.demo.services.auth.AuthService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@AllArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponseDTO> register(@Valid @RequestBody RegisterRequestDTO request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody LoginRequestDTO request) {
        return ResponseEntity.ok(authService.login(request));
    }
}
