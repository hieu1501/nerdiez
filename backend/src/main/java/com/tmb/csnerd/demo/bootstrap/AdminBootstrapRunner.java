package com.tmb.csnerd.demo.bootstrap;

import com.tmb.csnerd.demo.models.User;
import com.tmb.csnerd.demo.models.UserRole;
import com.tmb.csnerd.demo.repositories.UserRepository;
import com.tmb.csnerd.demo.repositories.UserRoleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import jakarta.transaction.Transactional;
import java.util.Set;

@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "app.bootstrap.admin", name = "enabled", havingValue = "true")
public class AdminBootstrapRunner implements CommandLineRunner {
    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.bootstrap.admin.username:}")
    private String username;

    @Value("${app.bootstrap.admin.password:}")
    private String password;

    @Value("${app.bootstrap.admin.role-code:ADMIN}")
    private String roleCode;

    @Override
    @Transactional
    public void run(String... args) {
        if (username == null || username.isBlank() || password == null || password.isBlank()) {
            log.warn("Admin bootstrap enabled but username/password not set; skipping.");
            return;
        }
        if (userRepository.findByUsername(username).isPresent()) {
            log.info("Admin bootstrap user already exists; skipping.");
            return;
        }

        UserRole role = userRoleRepository.findByRoleCode(roleCode)
                .orElseThrow(() -> new IllegalStateException("Role " + roleCode + " not found"));

        User user = new User();
        user.setUsername(username);
        user.setPwHash(passwordEncoder.encode(password));
        user.setActive(true);
        user.setRole(role);
        user.setVotes(Set.of());
        userRepository.save(user);
        log.info("Admin bootstrap user created: {}", username);
    }
}
