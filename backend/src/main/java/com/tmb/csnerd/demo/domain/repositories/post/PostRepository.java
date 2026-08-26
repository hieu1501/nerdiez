package com.tmb.csnerd.demo.domain.repositories.post;

import com.tmb.csnerd.demo.domain.models.Post;
import com.tmb.csnerd.demo.domain.repositories.post.projections.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PostRepository extends JpaRepository<Post, Long> {
    // BEGIN - QUERIES FOR PUBLIC

    @Query("""
        SELECT p.id FROM Post p
        LEFT JOIN p.category c
        WHERE p.isActive = true AND c.slugName = :categorySlug
    """)
    Slice<Long> getActivePostIdsSliceByCategorySlug(@Param("categorySlug") String categorySlug, Pageable pageable);

    @Query("""
        SELECT p.id FROM Post p
        LEFT JOIN p.category c
        WHERE p.isActive = true AND c.slugName = :categorySlug and p.slug = :slugName
    """)
    Optional<Long> getActivePostIdByCategoryAndSlugName(@Param("categorySlug") String categorySlug, @Param("slugName") String slugName);

    @Query("""
        SELECT
            p.id AS id,
            p.slug AS slug,
            p.title AS title,
            a.username AS authorName,
            c.name AS categoryName,
            c.slugName AS categorySlug,
            p.createdAt AS createdAt,
            p.updatedAt AS updatedAt
        FROM Post p
        JOIN p.author a
        JOIN p.category c
        JOIN p.postMetadata m
        WHERE p.id IN :ids
    """)
    List<PublicPostBriefContentProjection> getPostInformationByIds(@Param("ids") List<Long> ids);

    @Query("""
        SELECT
            p.id AS postId,
            m.upvoteCount AS upvoteCount,
            m.downvoteCount AS downvoteCount,
            m.voteVersion AS voteVersion
        FROM Post p
        JOIN p.postMetadata m
        JOIN p.category c
        WHERE p.slug = :slugName AND c.slugName = :categorySlug
    """)
    Optional<PostVotesInformationProjection> getPostVoteInformationByCategorySlugAndSlugName(@Param("categorySlug") String categorySlug, @Param("slugName") String slugName);

    @Query("""
        SELECT
            p.id AS id,
            p.slug AS slug,
            p.title AS title,
            p.content AS content,
            a.username AS authorName,
            c.name AS categoryName,
            c.slugName AS categorySlug,
            p.createdAt AS createdAt,
            p.updatedAt AS updatedAt,
            p.featuredImage AS featuredImage,
            p.description AS description
        FROM Post p
        JOIN p.author a
        JOIN p.category c
        LEFT JOIN p.votes v
        WHERE p.id = :postId
        AND p.isActive = true
    """)
    Optional<PublicPostDetailContentProjection> getActivePostContentById(@Param("postId") Long postId);

    // END

    // BEGIN - QUERIES FOR ADMIN

    @Query(value = """
        SELECT p.id FROM Post p
    """, countQuery = "SELECT COUNT(p) FROM Post p")
    Page<Long> getPostsPage(Pageable pageable);

    @Query("""
        SELECT
            p.id AS id,
            p.slug AS slug,
            p.title AS title,
            a.username AS authorName,
            c.id AS categoryId,
            c.name AS categoryName,
            c.slugName AS categorySlug,
            p.createdAt AS createdAt,
            p.updatedAt AS updatedAt,
            p.isActive as isActive
        FROM Post p
        JOIN p.author a
        JOIN p.category c
        JOIN p.postMetadata m
        WHERE p.id IN :ids
    """)
    List<AdminPostBriefContentProjection> getPostInformationForAdminByIds(@Param("ids") List<Long> ids);

    @Query("""
        SELECT
            p.id AS id,
            p.slug AS slug,
            p.title AS title,
            p.content AS content,
            a.username AS authorName,
            c.id AS categoryId,
            c.name AS categoryName,
            c.slugName AS categorySlug,
            p.createdAt AS createdAt,
            p.updatedAt AS updatedAt,
            p.featuredImage AS featuredImage,
            p.description AS description,
            p.isActive AS isActive
        FROM Post p
        JOIN p.author a
        JOIN p.category c
        WHERE p.id = :postId
    """)
    Optional<AdminPostDetailContentProjection> getPostContentByPostId(@Param("postId") Long postId);

    // END
    @Query("""
        SELECT CASE WHEN COUNT(p) > 0 THEN true ELSE false END
        FROM Post p
        WHERE p.category.id = :categoryId
          AND p.isActive = true
    """)
    boolean existsActiveByCategoryId(@Param("categoryId") Long categoryId);

    @Query("""
        SELECT CASE WHEN COUNT(p) > 0 THEN true ELSE false END
        FROM Post p
        JOIN p.topics t
        WHERE t.id = :topicId
          AND p.isActive = true
    """)
    boolean existsActiveByTopicId(@Param("topicId") Long topicId);


    @Query("""
        SELECT p.id AS postId, t.id AS topicId, t.name AS topicName, t.slugName AS topicSlug
        FROM Post p
        JOIN p.topics t
        WHERE p.id IN (:postIds)
        ORDER BY t.slugName
    """)
    List<PostTopicsProjection> getTopicsByPostIdsSortedBySlugName(@Param("postIds") List<Long> postIds);

    @Query("""
        SELECT p.id
        FROM Post p
        JOIN p.category c
        WHERE c.id = :categoryId
    """)
    List<Long> getPostIdsByCategoryId(@Param("categoryId") Long categoryId);

    @Query("""
        SELECT p.id
        FROM Post p
        JOIN p.topics t
        WHERE t.id = :topicId
    """)
    List<Long> getPostIdsByTopicId(@Param("topicId") Long topicId);

    @Query("""
        SELECT p.id
        FROM Post p
        JOIN p.category c
        WHERE p.slug = :postSlug AND p.category.slugName = :categorySlug
    """)
    Optional<Long> getPostIdByCategorySlugAndPostSlug(@Param("categorySlug") String categorySlug, @Param("postSlug") String postSlug);
}
