package com.tmb.csnerd.demo.domain.services.refreshtoken;

import com.tmb.csnerd.demo.domain.models.User;
import com.tmb.csnerd.demo.domain.security.UserPrincipal;
import com.tmb.csnerd.demo.domain.models.RefreshToken;
import com.tmb.csnerd.demo.domain.repositories.auth.RefreshTokenRepository;
import com.tmb.csnerd.demo.exceptions.auth.InvalidTokenException;
import com.tmb.csnerd.demo.utils.AuthUtils;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Optional;

@Service
@AllArgsConstructor
public class RefreshTokenService {
    private final RefreshTokenRepository refreshTokenRepository;
    private final Logger log = LoggerFactory.getLogger(RefreshTokenService.class);

    @Scheduled(cron = "${app.schedule.refresh-token-cleanup}")
    @Transactional
    public void deleteStaleTokenOnSchedule() {
        int count = refreshTokenRepository.deleteStaleTokens(Instant.now());
        log.info("Deleted " + count + " stale refresh tokens");
    }

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void deleteStaleTokenOnServerStart() {
        int count = refreshTokenRepository.deleteStaleTokens(Instant.now());
        log.info("Deleted " + count + " stale refresh tokens");
    }

    public RefreshToken validate(String rawToken) {
        RefreshToken token = refreshTokenRepository
                .findByTokenHashAndRevokedAtIsNull(hash(rawToken))
                .orElseThrow(InvalidTokenException::new);

        if (token.getExpiresAt().isBefore(Instant.now())) {
            throw new InvalidTokenException();
        }
        return token;
    }

    public String generateRefreshToken(UserPrincipal userPrincipal) {
        return generateRefreshToken(userPrincipal.getUser());
    }

    public String generateRefreshToken(String currentRawToken) {
        String currentHashToken = hash(currentRawToken);
        Optional<RefreshToken> currentToken = refreshTokenRepository.findByTokenHashAndRevokedAtIsNull(currentHashToken);
        return currentToken.map(refreshToken -> generateRefreshToken(refreshToken.getUser())).orElse(null);
    }

    public void revoke(String rawToken) {
        refreshTokenRepository.findByTokenHashAndRevokedAtIsNull(hash(rawToken))
                .ifPresent(token -> {
                    token.setRevokedAt(Instant.now());
                    refreshTokenRepository.save(token);
                });
    }

    private String generateRefreshToken(User user) {
        String rawToken = generateRawToken();
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(user);
        refreshToken.setTokenHash(hash(rawToken));
        refreshToken.setExpiresAt(Instant.now().plus(AuthUtils.getRefreshTokenExpireDays(), ChronoUnit.DAYS));
        refreshToken.setCreatedAt(Instant.now());
        refreshTokenRepository.save(refreshToken);
        return rawToken;
    }

    private String generateRawToken() {
        byte[] bytes = new byte[32];
        new SecureRandom().nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String hash(String rawToken) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException(e);
        }
    }
}
