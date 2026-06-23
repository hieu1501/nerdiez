package com.tmb.csnerd.demo.repositories;

import com.tmb.csnerd.demo.models.Category;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Long> {
}
