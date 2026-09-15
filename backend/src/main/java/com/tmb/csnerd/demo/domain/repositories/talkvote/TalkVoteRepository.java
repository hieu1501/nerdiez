package com.tmb.csnerd.demo.domain.repositories.talkvote;

import com.tmb.csnerd.demo.domain.models.TalksVote;
import com.tmb.csnerd.demo.domain.models.TalksVoteId;
import com.tmb.csnerd.demo.domain.repositories.talkvote.projections.TalkVotesByUserProjection;
import com.tmb.csnerd.demo.domain.repositories.talkvote.projections.TalkVotesInformationProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface TalkVoteRepository extends JpaRepository<TalksVote, TalksVoteId> {
    @Modifying
    @Query(value = """
        INSERT INTO talks_vote (talk_id, user_id, vote)
        VALUES (:talkId, :userId, :vote)
        ON DUPLICATE KEY UPDATE vote = :vote
    """, nativeQuery = true)
    int upsertVote(@Param("talkId") Long talkId, @Param("userId") Long userId, @Param("vote") Byte vote);

    @Query("""
        SELECT v.vote
        FROM TalksVote v
        JOIN v.talk t
        JOIN v.user u
        WHERE t.id = :talkId AND u.id = :userId
    """)
    Optional<Byte> getVoteForTalkByUser(@Param("talkId") Long talkId, @Param("userId") Long userId);

    @Query("""
        SELECT t.id AS talkId, v.vote AS vote
        FROM TalksVote v
        JOIN v.talk t
        JOIN v.user u
        WHERE t.id IN :talkIds
            AND u.id = :userId
    """)
    List<TalkVotesByUserProjection> getVoteForTalksByUser(@Param("talkIds") Set<Long> talkIds, @Param("userId") Long userId);

    @Query("""
        SELECT
            talk.id AS talkId,
            metadata.upvoteCount AS upvoteCount,
            metadata.downvoteCount AS downvoteCount,
            metadata.voteVersion AS voteVersion
        FROM Talk talk
        JOIN talk.talkMetadata metadata
        WHERE talk.id IN :ids
    """)
    List<TalkVotesInformationProjection> getTalkVoteInformationByIds(@Param("ids") Set<Long> ids);

    @Query("""
        SELECT
            talk.id AS talkId,
            metadata.upvoteCount AS upvoteCount,
            metadata.downvoteCount AS downvoteCount,
            metadata.voteVersion AS voteVersion
        FROM Talk talk
        JOIN talk.talkMetadata metadata
        WHERE talk.id = :id
    """)
    Optional<TalkVotesInformationProjection> getTalkVoteInformationById(@Param("id") Long id);
}
