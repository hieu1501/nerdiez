package com.tmb.csnerd.demo.domain.services.category;

import com.tmb.csnerd.demo.dto.category.CategoryResponseDTO;
import com.tmb.csnerd.demo.dto.category.CreateCategoryDTO;
import com.tmb.csnerd.demo.dto.category.ReplaceCategoryDTO;
import com.tmb.csnerd.demo.dto.category.UpdateCategoryDTO;
import com.tmb.csnerd.demo.exceptions.ConflictStatusException;
import com.tmb.csnerd.demo.exceptions.category.CategoryNotFoundException;
import com.tmb.csnerd.demo.domain.models.Category;
import com.tmb.csnerd.demo.domain.repositories.CategoryRepository;
import com.tmb.csnerd.demo.domain.repositories.PostRepository;
import com.tmb.csnerd.demo.utils.SlugifyUtils;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@AllArgsConstructor
@Service
public class CategoryCommandService {
    private final CategoryRepository categoryRepository;
    private final PostRepository postRepository;

    @Transactional
    public CategoryResponseDTO createCategory(CreateCategoryDTO request) {
        Category category = new Category();
        category.setName(request.name());
        category.setSlugName(SlugifyUtils.slugify(request.name()));
        category.setDescription(request.description());
        return convertToCategoryDTO(categoryRepository.save(category));
    }

    @Transactional
    public CategoryResponseDTO patchCategory(Long categoryId, UpdateCategoryDTO request) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new CategoryNotFoundException(categoryId));
        modifyCategoryIfChanged(category, request.name(), request.description());
        return convertToCategoryDTO(categoryRepository.save(category));
    }

    @Transactional
    public CategoryResponseDTO putCategory(Long categoryId, ReplaceCategoryDTO request) {
        Category category = categoryRepository.findById(categoryId)
                .orElse(null);
        if (category == null) {
            category = new Category();
        }
        modifyCategoryIfChanged(category, request.name(), request.description());
        return convertToCategoryDTO(categoryRepository.save(category));
    }

    @Transactional
    public void deleteCategory(Long categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new CategoryNotFoundException(categoryId));
        if (postRepository.existsActiveByCategoryId(categoryId)) {
            throw new ConflictStatusException("Category is used by active posts");
        }
        categoryRepository.delete(category);
    }

    private void modifyCategoryIfChanged(Category category, String newName, String newDescription) {
        if (category.getName() == null || (!newName.isBlank() && !category.getName().equals(newName))) {
            category.setName(newName);
            category.setSlugName(SlugifyUtils.slugify(newName));
        }
        if (category.getDescription() == null || !category.getDescription().equals(newDescription)) {
            if (newDescription.isBlank()) {
                category.setDescription(null);
            }
            else {
                category.setDescription(newDescription);
            }
        }
    }

    private CategoryResponseDTO convertToCategoryDTO(Category category) {
        return new CategoryResponseDTO(category.getId(), category.getName(), category.getSlugName(), category.getDescription());
    }
}
