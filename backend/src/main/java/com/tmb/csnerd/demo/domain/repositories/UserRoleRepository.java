package com.tmb.csnerd.demo.domain.repositories;

import com.tmb.csnerd.demo.domain.models.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRoleRepository extends JpaRepository<UserRole, Long> {
    Optional<UserRole> findByRoleCode(String roleCode);
}
