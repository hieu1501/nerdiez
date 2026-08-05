package com.tmb.csnerd.demo.domain.services.category;

import com.tmb.csnerd.demo.domain.models.Category;
import com.tmb.csnerd.demo.domain.repositories.CategoryRepository;
import com.tmb.csnerd.demo.dto.category.CategoryDetailDTO;
import com.tmb.csnerd.demo.exceptions.category.CategoryNotFoundException;
import lombok.AllArgsConstructor;
import org.springframework.cache.annotation.CacheConfig;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@AllArgsConstructor
@Service
public class CategoryQueryService {
    private final CategoryRepository categoryRepository;

    @Cacheable(value = "categories", key = "'all'")
    public List<CategoryDetailDTO> getAllCategories() {
        return categoryRepository.findAll()
                .stream()
                .map(CategoryDetailDTO::from)
                .collect(Collectors.toList());
    }

    public Category getCategoryById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new CategoryNotFoundException(id));
    }
}
