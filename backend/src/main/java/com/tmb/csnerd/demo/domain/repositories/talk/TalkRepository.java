package com.tmb.csnerd.demo.domain.repositories.talk;

import com.tmb.csnerd.demo.domain.models.Talk;
import com.tmb.csnerd.demo.domain.repositories.talk.projections.AdminTalkContentProjection;
import com.tmb.csnerd.demo.domain.repositories.talk.projections.ProfileTalkContentProjection;
import com.tmb.csnerd.demo.domain.repositories.talk.projections.PublicTalkContentProjection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface TalkRepository extends JpaRepository<Talk, Long> {
    @Query("""
        SELECT talk.id
        FROM Talk talk
        JOIN talk.topic topic
        JOIN talk.author u
        WHERE u.id = :userId
            AND topic.publicUri = :topicPublicUri
    """)
    Slice<Long> getTalksForProfileInSlice(@Param("topicPublicUri") String topicPublicUri, @Param("userId") Long userId, Pageable pageable);

    @Query("""
        SELECT talk.id
        FROM Talk talk
        JOIN talk.topic topic
        WHERE talk.isActive = true
            AND topic.isActive = true
            AND topic.publicUri = :topicPublicUri
    """)
    Slice<Long> getActiveTalkIdsByTopicPublicUri(@Param("topicPublicUri") String topicPublicUri, Pageable pageable);

    @Query(value = "SELECT talk.id FROM Talk talk JOIN talk.topic topic WHERE topic.id = :topicId",
            countQuery = "SELECT COUNT(talk) FROM Talk talk JOIN talk.topic topic WHERE topic.id = :topicId")
    Page<Long> getTalkIdsForAdmin(@Param("topicId") Long topicId, Pageable pageable);

    @Query("""
        SELECT talk.id
        FROM Talk talk
        JOIN talk.topic topic
        WHERE talk.isActive = true
          AND topic.isActive = true
          AND talk.publicUri = :publicUri
    """)
    Optional<Long> getActiveTalkIdByPublicUri(@Param("publicUri") String publicUri);

    @Query("""
        SELECT
            talk.id AS id,
            talk.publicUri AS publicUri,
            talk.content AS content,
            topic.name AS topicName,
            topic.slug AS topicSlug,
            topic.publicUri AS topicPublicUri,
            category.name AS categoryName,
            category.slugName AS categorySlug,
            talk.createdAt AS createdAt,
            talk.updatedAt AS updatedAt,
            talk.isActive AS isActive
        FROM Talk talk
        JOIN talk.author author
        JOIN talk.topic topic
        JOIN talk.topic.category category
        WHERE talk.id IN :ids
    """)
    List<ProfileTalkContentProjection> getProfileTalkContentByIds(@Param("ids") Set<Long> ids);

    @Query("""
        SELECT
            talk.id AS id,
            talk.publicUri AS publicUri,
            talk.content AS content,
            author.username AS authorName,
            topic.name AS topicName,
            topic.slug AS topicSlug,
            topic.publicUri AS topicPublicUri,
            category.name AS categoryName,
            category.slugName AS categorySlug,
            talk.createdAt AS createdAt,
            talk.updatedAt AS updatedAt
        FROM Talk talk
        JOIN talk.author author
        JOIN talk.topic topic
        JOIN talk.topic.category category
        WHERE talk.id IN :ids
    """)
    List<PublicTalkContentProjection> getPublicTalkContentByIds(@Param("ids") Set<Long> ids);

    @Query("""
        SELECT
            talk.id AS id,
            talk.publicUri AS publicUri,
            talk.content AS content,
            author.username AS authorName,
            topic.id AS topicId,
            topic.name AS topicName,
            topic.slug AS topicSlug,
            topic.publicUri AS topicPublicUri,
            category.id AS categoryId,
            category.name AS categoryName,
            category.slugName AS categorySlug,
            talk.createdAt AS createdAt,
            talk.updatedAt AS updatedAt,
            talk.isActive AS isActive
        FROM Talk talk
        JOIN talk.author author
        JOIN talk.topic topic
        JOIN talk.topic.category category
        WHERE talk.id IN :ids
    """)
    List<AdminTalkContentProjection> getAdminTalkContentByIds(@Param("ids") Set<Long> ids);

    @Query("""
        SELECT talk
        FROM Talk talk
        JOIN FETCH talk.author
        JOIN FETCH talk.topic
        WHERE talk.id = :id
    """)
    Optional<Talk> getTalkById(@Param("id") Long id);

    @Query("SELECT talk.id FROM Talk talk WHERE talk.topic.id = :topicId")
    List<Long> getTalkIdsByTopicId(@Param("topicId") Long topicId);

    @Query("""
        SELECT CASE WHEN COUNT(talk) > 0 THEN true ELSE false END
        FROM Talk talk
        WHERE talk.topic.id = :topicId
    """)
    boolean existsTalkByTopicId(@Param("topicId") Long topicId);
}
