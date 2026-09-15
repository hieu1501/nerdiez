package com.tmb.csnerd.demo.domain.services.auth;

import com.tmb.csnerd.demo.domain.models.PostsVote;
import com.tmb.csnerd.demo.domain.models.TalksVote;
import com.tmb.csnerd.demo.domain.models.User;
import com.tmb.csnerd.demo.domain.models.UserRole;
import com.tmb.csnerd.demo.domain.repositories.user.UserRepository;
import com.tmb.csnerd.demo.domain.security.UserPrincipal;
import com.tmb.csnerd.demo.domain.repositories.user.UserRoleRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class UserPrincipalService implements UserDetailsService {
    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username).orElseThrow(() -> new UsernameNotFoundException(username));
        return new UserPrincipal(user);
    }

    public Optional<UserPrincipal> getUserBySubject(String subject) {
        return userRepository.findBySubject(subject).map(UserPrincipal::new);
    }

    @Transactional
    public UserPrincipal createUserBySubjectAndEmail(String subject, String email) {
        UserRole role = userRoleRepository.findByRoleCode("USER")
                .orElseThrow(() -> new IllegalArgumentException("Role USER not found"));
        User user = new User();
        user.setEmail(email);
        String username = AuthUtils.extractUsernameFromEmail(email);
        user.setUsername(username);
        user.setSubject(subject);
        user.setActive(true);
        user.setRole(role);
        Set<PostsVote> postVotes = Set.of();
        Set<TalksVote> talkVotes = Set.of();
        user.setPostsVotes(postVotes);
        user.setTalksVotes(talkVotes);
        return new UserPrincipal(userRepository.save(user));
    }

    public UserPrincipal convertJwtToUserPrincipal(Jwt jwt) {
        if (jwt == null) return null;
        String subject = jwt.getSubject();
        return getUserBySubject(subject).orElse(null);
    }
}
