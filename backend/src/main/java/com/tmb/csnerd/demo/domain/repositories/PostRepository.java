package com.tmb.csnerd.demo.domain.repositories;

import com.tmb.csnerd.demo.domain.models.Post;
import com.tmb.csnerd.demo.dto.post.AdminPostBriefDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PostRepository extends JpaRepository<Post, Long> {
    @Query("""
        SELECT new com.tmb.csnerd.demo.dto.post.AdminPostBriefDTO(
            p.id,
            p.title,
            a.username,
            c.id,
            c.name,
            p.createdAt,
            p.updatedAt,
            COUNT(CASE WHEN v.isActive = true AND v.vote = 1 THEN v.id.userId ELSE NULL END),
            COUNT(CASE WHEN v.isActive = true AND v.vote = -1 THEN v.id.userId ELSE NULL END),
            p.isActive
       )
       FROM Post p
       JOIN p.author a
       JOIN p.category c
       LEFT JOIN p.votes v
       GROUP BY
           p.id,
           p.title,
           a.username,
           c.id,
           c.name,
           p.createdAt,
           p.updatedAt,
           p.isActive
    """)
    Page<AdminPostBriefDTO> getAllPostBriefPage(Pageable pageable);

    @Query("""
        SELECT p FROM Post p
        LEFT JOIN FETCH p.author a
        LEFT JOIN FETCH p.category c
        LEFT JOIN FETCH p.topics t
        LEFT JOIN FETCH p.postMetadata pm
        WHERE p.isActive = true
        ORDER BY p.createdAt DESC
    """)
    List<Post> getCreatedDescActivePosts();

    @Query("""
        SELECT p FROM Post p
        LEFT JOIN p.votes v
        WHERE p.isActive = true
        GROUP BY p.id
        ORDER BY SUM(CASE WHEN v.vote = 1 THEN 1 ELSE 0 END) DESC
""")
    List<Post> getUpvotesDescActivePosts();

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
        SELECT p FROM Post p
        WHERE p.id = :postId
        AND p.isActive = true
    """)
    Optional<Post> findActivePostByPostId(@Param("postId") Long postId);

    @Query("""
        SELECT p FROM Post p
        WHERE p.id = :postId
    """)
    Optional<Post> findPostByPostId(@Param("postId") Long postId);

    @Query("""
        SELECT (p.id,
        SUM(CASE WHEN v.isActive = true AND v.vote = 1 THEN 1 ELSE 0 END),
        SUM(CASE WHEN v.isActive = true AND v.vote = -1 THEN 1 ELSE 0 END))
        FROM Post p
        LEFT JOIN p.votes v
        WHERE p.id IN :postIds
        GROUP BY p.id
    """)
    List<Object[]> getVoteCountsByPostIds(@Param("postIds") List<Long> postIds);
}
