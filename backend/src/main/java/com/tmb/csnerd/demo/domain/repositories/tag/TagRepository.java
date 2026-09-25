package com.tmb.csnerd.demo.domain.repositories.tag;

import com.tmb.csnerd.demo.domain.models.Tag;
import com.tmb.csnerd.demo.domain.repositories.tag.projections.TagDetailProjection;
import com.tmb.csnerd.demo.domain.repositories.tag.projections.TagUseCountProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface TagRepository extends JpaRepository<Tag, Long> {
    @Query("""
        SELECT t.id AS id, t.slug AS slug, COUNT(p.id) AS postUseCount, COUNT(tp.id) AS topicUseCount, t.isActive AS isActive
        FROM Tag t
        LEFT JOIN t.posts p
        LEFT JOIN t.topics tp
        GROUP BY t.id, t.slug, t.isActive
    """)
    List<TagDetailProjection> getAllTags();

    @Query("""
        SELECT t FROM Tag t
        WHERE t.isActive = true
    """)
    List<Tag> getAllActiveTags();

    @Query("""
        SELECT COUNT(p.id) AS postUseCount, COUNT(tp.id) AS topicUseCount
        FROM Tag t
        LEFT JOIN t.posts p
        LEFT JOIN t.topics tp
        WHERE t.id = :id
        GROUP BY t.id
    """)
    Optional<TagUseCountProjection> getUseCountByTagId(@Param("id") Long tagId);

    @Query("""
        SELECT t FROM Tag t
        WHERE t.id IN :tagIds
    """)
    Set<Tag> getTagsByIds(@Param("tagIds") Set<Long> tagIds);

    @Query("""
        SELECT t FROM Tag t
        WHERE t.slug IN :tagSlugs AND t.isActive = true
    """)
    Set<Tag> getActiveTagsBySlugNames(@Param("tagSlugs") Set<String> tagSlugs);
}
