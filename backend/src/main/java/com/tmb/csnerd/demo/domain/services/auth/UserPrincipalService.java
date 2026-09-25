package com.tmb.csnerd.demo.domain.services.auth;

import com.tmb.csnerd.demo.domain.models.PostsVote;
import com.tmb.csnerd.demo.domain.models.TalksVote;
import com.tmb.csnerd.demo.domain.models.User;
import com.tmb.csnerd.demo.domain.models.UserRole;
import com.tmb.csnerd.demo.domain.repositories.user.UserRepository;
import com.tmb.csnerd.demo.domain.security.AuthProperties;
import com.tmb.csnerd.demo.domain.security.UserPrincipal;
import com.tmb.csnerd.demo.domain.repositories.user.UserRoleRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import java.util.Objects;
import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class UserPrincipalService implements UserDetailsService {
    // users.username is varchar(50); leaves room for a numeric suffix.
    private static final int MAX_USERNAME_BASE_LENGTH = 40;

    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final AuthProperties authProperties;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username).orElseThrow(() -> new UsernameNotFoundException(username));
        return new UserPrincipal(user);
    }

    public Optional<UserPrincipal> getUserBySubject(String subject) {
        return userRepository.findBySubject(subject).map(UserPrincipal::new);
    }

    // A Keycloak reset gives the same person a new subject; a verified email lets us re-link their account.
    @Transactional
    public Optional<UserPrincipal> relinkSubjectByVerifiedEmail(String subject, String email, Boolean emailVerified) {
        if (email == null || !Boolean.TRUE.equals(emailVerified)) return Optional.empty();
        return userRepository.findByEmail(email).map(user -> {
            user.setSubject(subject);
            return new UserPrincipal(userRepository.save(user));
        });
    }

    @Transactional
    public UserPrincipal createUserBySubjectAndEmail(String subject, String email) {
        boolean isAdmin = email != null && authProperties.getAdminEmails().contains(email.toLowerCase());
        String roleCode = isAdmin ? "ADMIN" : "USER";
        UserRole role = userRoleRepository.findByRoleCode(roleCode)
                .orElseThrow(() -> new IllegalArgumentException("Role " + roleCode + " not found"));
        User user = new User();
        user.setEmail(email);
        user.setUsername(generateUniqueUsername(AuthUtils.extractUsernameFromEmail(email)));
        user.setSubject(subject);
        user.setActive(true);
        user.setRole(role);
        Set<PostsVote> postVotes = Set.of();
        Set<TalksVote> talkVotes = Set.of();
        user.setPostsVotes(postVotes);
        user.setTalksVotes(talkVotes);
        return new UserPrincipal(userRepository.save(user));
    }

    @Transactional
    public void updateAvatarUrl(UserPrincipal principal, String avatarUrl) {
        User user = principal.getUser();
        if (Objects.equals(user.getAvatarUrl(), avatarUrl)) return;
        user.setAvatarUrl(avatarUrl);
        userRepository.save(user);
    }

    // Different emails can share a local part (john@a.com, john@b.com), so suffix until free.
    private String generateUniqueUsername(String base) {
        String trimmed = base.length() > MAX_USERNAME_BASE_LENGTH ? base.substring(0, MAX_USERNAME_BASE_LENGTH) : base;
        String candidate = trimmed;
        for (int suffix = 2; userRepository.existsByUsername(candidate); suffix++) {
            candidate = trimmed + suffix;
        }
        return candidate;
    }

    public UserPrincipal convertJwtToUserPrincipal(Jwt jwt) {
        if (jwt == null) return null;
        String subject = jwt.getSubject();
        return getUserBySubject(subject).orElse(null);
    }
}
