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
    """)
    List<String> getAllImagePaths();

    @Query("""
        SELECT i FROM Image i
        WHERE i.useCount = 0 /* AND DATEDIFF(:now, i.createdAt) >= 1 */
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
        SET i.useCount = i.useCount + 1
        WHERE i.path IN (:imagePaths)
    """)
    int setImagesInUse(@Param("imagePaths") List<String> imagePaths);

    @Modifying
    @Query("""
        UPDATE Image i
        SET i.useCount = GREATEST(0, i.useCount - 1)
        WHERE i.path IN (:imagePaths)
    """)
    int setImagesNotInUse(@Param("imagePaths") List<String> imagePaths);
}
