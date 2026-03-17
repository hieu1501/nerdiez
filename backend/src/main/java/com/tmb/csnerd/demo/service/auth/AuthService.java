package com.tmb.csnerd.demo.service.auth;

import com.tmb.csnerd.demo.dto.auth.AuthResponseDTO;
import com.tmb.csnerd.demo.dto.auth.LoginRequestDTO;
import com.tmb.csnerd.demo.dto.auth.RegisterRequestDTO;
import com.tmb.csnerd.demo.exception.ConflictStatusException;
import com.tmb.csnerd.demo.exception.UnauthorizedException;
import com.tmb.csnerd.demo.model.PostsVote;
import com.tmb.csnerd.demo.model.User;
import com.tmb.csnerd.demo.model.UserRole;
import com.tmb.csnerd.demo.repository.UserRepository;
import com.tmb.csnerd.demo.repository.UserRoleRepository;
import com.tmb.csnerd.demo.security.UserPrincipal;
import lombok.AllArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class AuthService {
    private static final long ACCESS_TOKEN_EXPIRES_SECONDS = 10 * 60 * 60;
    private final JwtEncoder jwtEncoder;
    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final PasswordEncoder passwordEncoder;

    public String generateToken(Authentication authentication) {
        Instant now = Instant.now();
        String scope = authentication.getAuthorities()
                .stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.joining(" "));

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("self")
                .issuedAt(now)
                .expiresAt(now.plus(ACCESS_TOKEN_EXPIRES_SECONDS, ChronoUnit.SECONDS))
                .subject(authentication.getName())
                .claim("scope", scope)
                .build();

        return jwtEncoder.encode(JwtEncoderParameters.from(claims)).getTokenValue();
    }

    public AuthResponseDTO login(LoginRequestDTO request) {
        User user = userRepository.findByUsername(request.username())
                .orElseThrow(() -> new UnauthorizedException(HttpStatus.UNAUTHORIZED));
        if (!user.isActive()) {
            throw new UnauthorizedException(HttpStatus.FORBIDDEN);
        }
        if (!passwordEncoder.matches(request.password(), user.getPwHash())) {
            throw new UnauthorizedException(HttpStatus.UNAUTHORIZED);
        }
        Authentication authentication = buildAuthentication(user);
        String token = generateToken(authentication);
        return new AuthResponseDTO(token, "Bearer", ACCESS_TOKEN_EXPIRES_SECONDS);
    }

    public AuthResponseDTO register(RegisterRequestDTO request) {
        if (userRepository.findByUsername(request.username()).isPresent()) {
            throw new ConflictStatusException("Username already exists");
        }
        UserRole role = userRoleRepository.findByRoleCode("USER")
                .orElseThrow(() -> new IllegalArgumentException("Role USER not found"));

        User user = new User();
        user.setUsername(request.username());
        user.setPwHash(passwordEncoder.encode(request.password()));
        user.setActive(true);
        user.setRole(role);
        Set<PostsVote> votes = Set.of();
        user.setVotes(votes);
        User savedUser = userRepository.save(user);
        Authentication authentication = buildAuthentication(savedUser);
        String token = generateToken(authentication);
        return new AuthResponseDTO(token, "Bearer", ACCESS_TOKEN_EXPIRES_SECONDS);
    }

    private Authentication buildAuthentication(User user) {
        UserPrincipal principal = new UserPrincipal(user);
        return new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
    }
}
