package com.tmb.csnerd.demo.domain.repositories;

import com.tmb.csnerd.demo.domain.models.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByTokenHashAndRevokedAtIsNull(String hash);

    @Modifying
    @Query("""
        DELETE FROM RefreshToken t
        WHERE t.expiresAt < :now
           OR t.revokedAt IS NOT NULL
        """)
    int deleteStaleTokens(@Param("now") Instant now);
}
