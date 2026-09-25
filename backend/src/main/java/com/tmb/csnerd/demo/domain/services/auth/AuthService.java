package com.tmb.csnerd.demo.domain.services.auth;

import com.tmb.csnerd.demo.domain.models.RefreshToken;
import com.tmb.csnerd.demo.domain.models.User;
import com.tmb.csnerd.demo.domain.security.AuthProperties;
import com.tmb.csnerd.demo.domain.security.UserPrincipal;
import com.tmb.csnerd.demo.domain.services.refreshtoken.RefreshTokenService;
import com.tmb.csnerd.demo.exceptions.UnauthorizedException;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class AuthService {
    public record IssuedTokenPair(String accessToken, String refreshToken) {}

    private final JwtEncoder jwtEncoder;
    private final RefreshTokenService refreshTokenService;
    private final AuthProperties authProperties;
    private final UserPrincipalService userPrincipalService;
    private final KeycloakSessionClient keycloakSessionClient;

    public IssuedTokenPair authenticateAdmin(Authentication authentication) {
        OidcUser oidcUser = (OidcUser) authentication.getPrincipal();
        assert (oidcUser != null);
        UserPrincipal userPrincipal = getUser(oidcUser);
        if (!userPrincipal.isAdmin()) {
            // Otherwise Keycloak's SSO session silently logs the same non-admin back in on retry
            keycloakSessionClient.logoutAllSessions(oidcUser.getSubject());
            throw new UnauthorizedException(HttpStatus.FORBIDDEN);
        }
        userPrincipalService.updateAvatarUrl(userPrincipal, oidcUser.getPicture());
        return issueTokenPair(userPrincipal);
    }

    public IssuedTokenPair authenticateUser(Authentication authentication) {
        OidcUser oidcUser = (OidcUser) authentication.getPrincipal();
        assert (oidcUser != null);
        UserPrincipal userPrincipal = getUser(oidcUser);
        userPrincipalService.updateAvatarUrl(userPrincipal, oidcUser.getPicture());
        return issueTokenPair(userPrincipal);
    }

    private UserPrincipal getUser(OidcUser oidcUser) {
        String subject = oidcUser.getSubject();
        String email =  oidcUser.getEmail();
        return userPrincipalService.getUserBySubject(subject)
                .or(() -> userPrincipalService.relinkSubjectByVerifiedEmail(subject, email, oidcUser.getEmailVerified()))
                .orElseGet(() -> userPrincipalService.createUserBySubjectAndEmail(subject, email));
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

    // Not transactional: the Keycloak HTTP call shouldn't hold a DB connection.
    public void logout(String rawRefreshToken, Jwt jwt) {
        Optional<User> user = Optional.ofNullable(rawRefreshToken)
                .flatMap(refreshTokenService::findOwner)
                .or(() -> Optional.ofNullable(userPrincipalService.convertJwtToUserPrincipal(jwt)).map(UserPrincipal::getUser));
        user.ifPresent(u -> {
            refreshTokenService.revokeAll(u);
            keycloakSessionClient.logoutAllSessions(u.getSubject());
        });
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
