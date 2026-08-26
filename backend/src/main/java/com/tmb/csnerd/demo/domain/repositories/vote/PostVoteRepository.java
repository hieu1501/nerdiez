package com.tmb.csnerd.demo.domain.repositories.vote;

import com.tmb.csnerd.demo.domain.models.PostsVote;
import com.tmb.csnerd.demo.domain.models.PostsVoteId;
import com.tmb.csnerd.demo.domain.repositories.post.projections.PostVotesInformationProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PostVoteRepository extends JpaRepository<PostsVote, PostsVoteId> {
    @Modifying
    @Query(value = """
        INSERT INTO posts_vote (post_id, user_id, vote)
        VALUES (:postId, :userId, :vote)
        ON DUPLICATE KEY UPDATE
            vote = :vote
    """, nativeQuery = true)
    int upsertVote(@Param("postId") Long postId, @Param("userId") Long userId, @Param("vote") Byte vote);

    @Query("""
        SELECT v.vote FROM PostsVote v
        JOIN v.user u
        JOIN v.post p
        WHERE u.id = :userId AND p.id = :postId
    """)
    Optional<Byte> getVoteForPostIdByUserId(@Param("postId") Long postId, @Param("userId") Long userId);

    @Query("""
        SELECT
            p.id AS postId,
            m.upvoteCount AS upvoteCount,
            m.downvoteCount AS downvoteCount,
            m.voteVersion AS voteVersion
        FROM Post p
        JOIN p.postMetadata m
        WHERE p.id IN :ids
    """)
    List<PostVotesInformationProjection> getPostVoteInformationByIds(@Param("ids") List<Long> ids);
}