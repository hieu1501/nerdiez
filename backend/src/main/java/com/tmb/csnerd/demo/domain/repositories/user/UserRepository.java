package com.tmb.csnerd.demo.domain.repositories.user;

import com.tmb.csnerd.demo.domain.models.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    Optional<User> findBySubject(String subject);
    boolean existsByUsername(String username);
}
