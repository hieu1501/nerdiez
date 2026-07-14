package com.tmb.csnerd.demo.domain.repositories;

import com.tmb.csnerd.demo.domain.models.Category;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Long> {
}
