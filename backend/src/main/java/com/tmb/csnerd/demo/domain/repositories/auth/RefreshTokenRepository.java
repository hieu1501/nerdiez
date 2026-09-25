package com.tmb.csnerd.demo.domain.repositories.auth;

import com.tmb.csnerd.demo.domain.models.RefreshToken;
import com.tmb.csnerd.demo.domain.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByTokenHashAndRevokedAtIsNull(String hash);
    
    @Query("""
        SELECT t.user FROM RefreshToken t
        WHERE t.tokenHash = :hash
          AND t.revokedAt IS NULL
        """)
    Optional<User> findActiveOwnerByTokenHash(@Param("hash") String hash);

    @Modifying
    @Query("""
        UPDATE RefreshToken t
        SET t.revokedAt = :now
        WHERE t.user.id = :userId
          AND t.revokedAt IS NULL
        """)
    int revokeAllByUserId(@Param("userId") Long userId, @Param("now") Instant now);

    @Modifying
    @Query("""
        DELETE FROM RefreshToken t
        WHERE t.expiresAt < :now
           OR t.revokedAt IS NOT NULL
        """)
    int deleteStaleTokens(@Param("now") Instant now);
}
