package com.tmb.csnerd.demo.repository;

import com.tmb.csnerd.demo.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PostRepository extends JpaRepository<Post, Integer> {
    @Query("""
        SELECT p FROM Post p
        LEFT JOIN FETCH p.author a
        LEFT JOIN FETCH p.category c
        LEFT JOIN FETCH p.topics t
        LEFT JOIN FETCH p.postMetadata pm
        LEFT JOIN FETCH p.votes v
        WHERE p.isActive = true
        ORDER BY p.createdAt DESC
    """)
    List<Post> findMostRecentActivePost();

    @Query("""
        SELECT p FROM Post p
        LEFT JOIN p.votes v
        WHERE p.isActive = true 
        GROUP BY p.id
        ORDER BY SUM(CASE WHEN v.vote = 1 THEN 1 ELSE 0 END) DESC
""")
    List<Post> findMostUpvotedActivePost();

    @Query("""
        SELECT CASE WHEN COUNT(p) > 0 THEN true ELSE false END
        FROM Post p
        WHERE p.category.id = :categoryId
          AND p.isActive = true
    """)
    boolean existsActiveByCategoryId(@Param("categoryId") Integer categoryId);

    @Query("""
        SELECT CASE WHEN COUNT(p) > 0 THEN true ELSE false END
        FROM Post p
        JOIN p.topics t
        WHERE t.id = :topicId
          AND p.isActive = true
    """)
    boolean existsActiveByTopicId(@Param("topicId") Integer topicId);

    @Query("""
        SELECT p FROM Post p
        WHERE p.id = :postId
        AND p.isActive = true
    """)
    Optional<Post> findActivePostByPostId(@Param("postId") Integer postId);
}
