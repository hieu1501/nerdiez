package com.tmb.csnerd.demo.domain.services.auth;

import com.tmb.csnerd.demo.domain.models.RefreshToken;
import com.tmb.csnerd.demo.domain.security.AuthProperties;
import com.tmb.csnerd.demo.domain.security.UserPrincipal;
import com.tmb.csnerd.demo.domain.services.refreshtoken.RefreshTokenService;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class AuthService {
    public record IssuedTokenPair(String accessToken, String refreshToken) {}

    private final JwtEncoder jwtEncoder;
    private final RefreshTokenService refreshTokenService;
    private final AuthProperties authProperties;
    private final UserPrincipalService userPrincipalService;

    public IssuedTokenPair authenticateUser(Authentication authentication) {
        OidcUser oidcUser = (OidcUser) authentication.getPrincipal();
        assert (oidcUser != null);
        String subject = oidcUser.getSubject();
        String email =  oidcUser.getEmail();
        UserPrincipal user = userPrincipalService.getUserBySubject(subject)
                .orElseGet(() -> userPrincipalService.createUserBySubjectAndEmail(subject, email));
        return issueTokenPair(user);
    }

    public IssuedTokenPair issueTokenPair(UserPrincipal userPrincipal) {
        String accessToken = generateAccessToken(userPrincipal);
        String refreshToken = refreshTokenService.generateRefreshToken(userPrincipal);
        return new IssuedTokenPair(accessToken, refreshToken);
    }

    @Transactional
    public IssuedTokenPair refreshAccessToken(String rawRefreshToken) {
        RefreshToken refreshToken = refreshTokenService.validate(rawRefreshToken);
        refreshTokenService.revoke(rawRefreshToken);
        UserPrincipal user = new UserPrincipal(refreshToken.getUser());
        return issueTokenPair(user);
    }

    private String generateAccessToken(UserPrincipal userPrincipal) {
        Instant now = Instant.now();
        String scope = userPrincipal.getAuthorities()
                .stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.joining(" "));

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("self")
                .issuedAt(now)
                .expiresAt(now.plus(authProperties.getAccessTokenExpireSeconds(), ChronoUnit.SECONDS))
                .subject(userPrincipal.getSubject())
                .claim("scope", scope)
                .build();

        return jwtEncoder.encode(JwtEncoderParameters.from(claims)).getTokenValue();
    }
}
