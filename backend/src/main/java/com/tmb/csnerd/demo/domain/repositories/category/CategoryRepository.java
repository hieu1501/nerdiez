package com.tmb.csnerd.demo.domain.repositories.category;

import com.tmb.csnerd.demo.domain.models.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    @Query("""
        SELECT c FROM Category c
        WHERE c.isActive = true
    """)
    List<Category> getAllActiveCategories();

    @Query("""
        SELECT c.id FROM Category c
    """)
    List<Long> getAllCategoryIds();

    @Query("""
        SELECT c.id FROM Category c
        WHERE c.isActive = true
    """)
    List<Long> getAllActiveCategoryIds();

    @Query("""
        SELECT c FROM Category c
        WHERE c.slugName = :slugName AND c.isActive = true
     """)
    Optional<Category> findActiveBySlugName(@Param("slugName") String slugName);
}
