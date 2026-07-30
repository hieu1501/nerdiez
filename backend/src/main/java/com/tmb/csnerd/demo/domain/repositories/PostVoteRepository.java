package com.tmb.csnerd.demo.domain.repositories;

import com.tmb.csnerd.demo.domain.models.PostsVote;
import com.tmb.csnerd.demo.domain.models.PostsVoteId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface PostVoteRepository extends JpaRepository<PostsVote, PostsVoteId> {
    @Query("""
        SELECT pv from PostsVote pv
        WHERE pv.id = :id AND pv.isActive = true
    """)
    Optional<PostsVote> findActiveVoteById(@Param("id") PostsVoteId postsVoteId);
}
