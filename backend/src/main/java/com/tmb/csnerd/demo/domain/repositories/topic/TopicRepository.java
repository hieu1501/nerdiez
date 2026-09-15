package com.tmb.csnerd.demo.domain.repositories.topic;

import com.tmb.csnerd.demo.domain.models.Topic;
import com.tmb.csnerd.demo.domain.repositories.topic.projections.TopicTagsProjection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TopicRepository extends JpaRepository<Topic, Long> {
    @Query(value = """
        SELECT t.id FROM Topic t
        JOIN t.category c
    """, countQuery = "SELECT COUNT(t) FROM Topic t")
    Page<Long> getIdsInPage(Pageable pageable);

    @Query("""
        SELECT t.id FROM Topic t
        JOIN t.category c
        JOIN t.author u
        WHERE c.slugName = :categorySlug
            AND c.isActive = true
            AND t.isActive = true
    """)
    Slice<Long> getIdsForPublicInSlice(@Param("categorySlug") String categorySlug, Pageable pageable);

    @Query("""
        SELECT t.id FROM Topic t
        JOIN t.category c
        JOIN t.author u
        WHERE c.isActive = true
            AND u.id = :userId
    """)
    Slice<Long> getIdsForProfileInSlice(@Param("userId") Long userId, Pageable pageable);

    @Query("""
        SELECT t.id FROM Topic t
        JOIN t.category c
        WHERE t.isActive = true
            AND c.isActive = true
            AND t.publicUri = :publicUri
    """)
    Optional<Long> getActiveTopicIdByPublicUri(@Param("publicUri") String publicUri);

    @Query("""
        SELECT DISTINCT tp
        FROM Topic tp
        JOIN FETCH tp.category
        LEFT JOIN FETCH tp.tags
        WHERE tp.id = :topicId
    """)
    Optional<Topic> getTopicById(@Param("topicId") Long topicId);

    @Query("""
        SELECT DISTINCT tp
        FROM Topic tp
        JOIN FETCH tp.category
        LEFT JOIN FETCH tp.tags
        WHERE tp.publicUri = :publicUri AND tp.isActive = true
    """)
    Optional<Topic> getActiveTopicByPublicUri(@Param("publicUri") String publicUri);

    @Query("""
        SELECT t FROM Topic t
        LEFT JOIN FETCH t.category
        LEFT JOIN FETCH t.author
        WHERE t.id IN :ids
    """)
    List<Topic> getAllTopicsByIds(@Param("ids") List<Long> ids);

    @Query("""
        SELECT t.id AS topicId, tag.id AS tagId, tag.slug AS tagSlug
        FROM Topic t
        JOIN t.tags tag
        WHERE t.id IN :topicIds
        ORDER BY tag.slug
    """)
    List<TopicTagsProjection> getTagsByTopicIdsSortedBySlugName(@Param("topicIds") List<Long> topicIds);
}
