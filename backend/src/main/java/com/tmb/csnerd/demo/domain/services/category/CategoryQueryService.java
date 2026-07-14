package com.tmb.csnerd.demo.domain.services.category;

import com.tmb.csnerd.demo.domain.models.Category;
import com.tmb.csnerd.demo.domain.repositories.CategoryRepository;
import com.tmb.csnerd.demo.dto.category.CategoryResponseDTO;
import com.tmb.csnerd.demo.exceptions.category.CategoryNotFoundException;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@AllArgsConstructor
@Service
public class CategoryQueryService {
    private final CategoryRepository categoryRepository;

    public List<CategoryResponseDTO> getAllCategories() {
        return categoryRepository.findAll()
                .stream()
                .map(c -> new CategoryResponseDTO(c.getId(), c.getName(), c.getSlugName(), c.getDescription()))
                .collect(Collectors.toList());
    }

    public Optional<Category> getCategoryById(Long id) {
        return categoryRepository.findById(id);
    }
}
