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
        SELECT p.id
        FROM Post p
        JOIN p.category c
        WHERE p.isActive = true
            AND c.isActive = true
            AND c.slugName = :categorySlug
    """)
    Slice<Long> getActivePostIdsSliceByCategorySlug(@Param("categorySlug") String categorySlug, Pageable pageable);

    @Query("""
        SELECT p.id
        FROM Post p
        JOIN p.author u
        WHERE u.id = :userId
    """)
    Slice<Long> getPostIdsSliceForProfile(@Param("userId") Long userId, Pageable pageable);

    @Query("""
        SELECT p.id FROM Post p
        JOIN p.category c
        WHERE p.isActive = true
            AND c.isActive = true
            AND p.publicUri = :publicUri
    """)
    Optional<Long> getActivePostIdByPublicUri(@Param("publicUri") String publicUri);

    @Query("""
        SELECT p.id FROM Post p
        JOIN p.category c
        JOIN p.author u
        WHERE c.isActive = true
            AND u.id = :userId
            AND p.publicUri = :publicUri
    """)
    Optional<Long> getPostIdForProfileByPublicUri(@Param("publicUri") String publicUri, @Param("userId") Long userId);

    @Query("""
        SELECT
            p.id AS id,
            p.publicUri AS publicUri,
            p.slug AS slug,
            p.title AS title,
            a.username AS authorName,
            c.name AS categoryName,
            c.slugName AS categorySlug,
            p.createdAt AS createdAt,
            p.updatedAt AS updatedAt,
            p.featuredImage AS featuredImage
        FROM Post p
        JOIN p.author a
        JOIN p.category c
        JOIN p.postMetadata m
        WHERE p.id IN :ids
            AND p.isActive = true
            AND c.isActive = true
    """)
    List<PublicPostBriefContentProjection> getPostInformationByIds(@Param("ids") List<Long> ids);

    @Query("""
        SELECT
            p.id AS id,
            p.publicUri AS publicUri,
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
        WHERE p.id = :postId
        AND p.isActive = true
    """)
    Optional<PublicPostDetailContentProjection> getActivePostContentById(@Param("postId") Long postId);

    @Query("""
        SELECT
            p.id AS id,
            p.publicUri AS publicUri,
            p.slug AS slug,
            p.title AS title,
            c.name AS categoryName,
            c.slugName AS categorySlug,
            p.createdAt AS createdAt,
            p.updatedAt AS updatedAt,
            p.featuredImage AS featuredImage,
            p.isActive as isActive
        FROM Post p
        JOIN p.category c
        JOIN p.postMetadata m
        WHERE p.id IN :ids
    """)
    List<PersonalPostBriefContentProjection> getPostInformationForProfileByIds(@Param("ids") List<Long> ids);

    @Query("""
        SELECT
            p.id AS id,
            p.publicUri AS publicUri,
            p.slug AS slug,
            p.title AS title,
            p.content AS content,
            c.name AS categoryName,
            c.slugName AS categorySlug,
            p.createdAt AS createdAt,
            p.updatedAt AS updatedAt,
            p.featuredImage AS featuredImage,
            p.description AS description,
            p.isActive AS isActive
        FROM Post p
        JOIN p.category c
        WHERE p.id = :postId
    """)
    Optional<PersonalPostDetailContentProjection> getPersonalContentByPostId(@Param("postId") Long postId);
    // END

    // BEGIN - QUERIES FOR ADMIN
    @Query(value = """
        SELECT p.id FROM Post p
    """, countQuery = "SELECT COUNT(p) FROM Post p")
    Page<Long> getPostsPage(Pageable pageable);

    @Query("""
        SELECT
            p.id AS id,
            p.publicUri AS publicUri,
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
            p.publicUri AS publicUri,
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
        SELECT DISTINCT p
        FROM Post p
        JOIN FETCH p.category
        JOIN FETCH p.author
        LEFT JOIN FETCH p.tags
        WHERE p.id = :postId
    """)
    Optional<Post> getPostByPostId(@Param("postId") Long postId);

    @Query("""
        SELECT CASE WHEN COUNT(p) > 0 THEN true ELSE false END
        FROM Post p
        WHERE p.category.id = :categoryId
    """)
    boolean existsPostByCategoryId(@Param("categoryId") Long categoryId);

    @Query("""
        SELECT CASE WHEN COUNT(p) > 0 THEN true ELSE false END
        FROM Post p
        JOIN p.tags t
        WHERE t.id = :tagId
          AND p.isActive = true
    """)
    boolean existsActiveByTagId(@Param("tagId") Long tagId);


    @Query("""
        SELECT p.id AS postId, t.id AS tagId, t.slug AS tagSlug
        FROM Post p
        JOIN p.tags t
        WHERE p.id IN (:postIds)
        ORDER BY t.slug
    """)
    List<PostTagsProjection> getTagsByPostIdsSortedBySlugName(@Param("postIds") List<Long> postIds);

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
        JOIN p.tags t
        WHERE t.id = :tagId
    """)
    List<Long> getPostIdsByTagId(@Param("tagId") Long tagId);
}
