package com.tmb.csnerd.demo.services.auth;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.tmb.csnerd.demo.dto.auth.AuthResponseDTO;
import com.tmb.csnerd.demo.exceptions.ConflictStatusException;
import com.tmb.csnerd.demo.models.PostsVote;
import com.tmb.csnerd.demo.models.User;
import com.tmb.csnerd.demo.models.UserRole;
import com.tmb.csnerd.demo.repositories.UserRepository;
import com.tmb.csnerd.demo.repositories.UserRoleRepository;
import com.tmb.csnerd.demo.utils.AuthUtils;
import lombok.AllArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.stereotype.Service;

import java.util.Set;

@AllArgsConstructor
@Service
public class GoogleOAuthService {
    private final GoogleIdTokenVerifier verifier;
    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final JwtEncoder jwtEncoder;
    private final AuthUtils authUtils;

    public AuthResponseDTO loginWithGoogle(String credential) {
        try {
            GoogleIdToken idToken = verifier.verify(credential);
            GoogleIdToken.Payload payload = idToken.getPayload();
            String email = payload.getEmail();
            String googleSub = payload.getSubject();
            User user = userRepository.findByGoogleSub(googleSub)
                    .or(() -> userRepository.findByEmail(email))
                    .orElseGet(() -> createGoogleUser(email, googleSub));
            Authentication authentication = authUtils.buildAuthentication(user);
            String token = authUtils.generateToken(authentication, jwtEncoder);
            return new AuthResponseDTO(token, "Bearer", authUtils.getAccessTokenExpireSeconds());
        }
        catch (Exception e) {
            throw new BadCredentialsException(e.getMessage());
        }
    }

    private User createGoogleUser(String email, String googleSub) {
        if (userRepository.findByEmail(email).isPresent()) {
            throw new ConflictStatusException("Username already exists");
        }
        UserRole role = userRoleRepository.findByRoleCode("USER")
                .orElseThrow(() -> new IllegalArgumentException("Role USER not found"));

        User user = new User();
        String username = authUtils.extractUsernameFromEmail(email);
        user.setUsername(username);
        user.setEmail(email);
        user.setActive(true);
        user.setRole(role);
        user.setGoogleSub(googleSub);
        Set<PostsVote> votes = Set.of();
        user.setVotes(votes);
        return userRepository.save(user);
    }
}
