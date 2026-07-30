package com.tmb.csnerd.demo.domain.repositories;

import com.tmb.csnerd.demo.domain.models.Image;
import com.tmb.csnerd.demo.domain.models.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;

public interface ImageRepository extends JpaRepository<Image, Long> {
    @Query("""
        SELECT i.path FROM Image i
        WHERE i.post IS NOT NULL AND i.post.id = :postId
    """)
    List<String> findImagePathsByPostId(@Param("postId") Long postId);

    @Query("""
        SELECT i.path FROM Image i
    """)
    List<String> getAllImagePaths();

    @Query("""
        SELECT i FROM Image i
        WHERE i.post IS NULL /* AND DATEDIFF(:now, i.createdAt) >= 1 */
    """)
    List<Image> findStaleImages(@Param("now") Instant now);

    @Modifying
    @Query("""
        DELETE FROM Image i
        WHERE i.path IN (:paths)
    """)
    int deleteImagesFromList(@Param("paths") List<String> imagesToDelete);

    @Modifying
    @Query("""
        UPDATE Image i
        SET i.post = :post
        WHERE i.path IN (:imagePaths)
    """)
    int linkImagesToPostId(@Param("imagePaths") List<String> imagePaths, @Param("post") Post post);

    @Modifying
    @Query("""
        UPDATE Image i
        SET i.post = NULL
        WHERE i.path IN (:imagePaths)
    """)
    int unlinkImagesFromPaths(@Param("imagePaths") List<String> imagePaths);
}
