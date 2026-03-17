package com.tmb.csnerd.demo.repository;

import com.tmb.csnerd.demo.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Integer> {
}
