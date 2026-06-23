package com.tmb.csnerd.demo.services.category;

import com.tmb.csnerd.demo.dto.category.CategoryResponseDTO;
import com.tmb.csnerd.demo.dto.category.CreateCategoryDTO;
import com.tmb.csnerd.demo.dto.category.ReplaceCategoryDTO;
import com.tmb.csnerd.demo.dto.category.UpdateCategoryDTO;
import com.tmb.csnerd.demo.exceptions.ConflictStatusException;
import com.tmb.csnerd.demo.exceptions.category.CatergoryNotFound;
import com.tmb.csnerd.demo.models.Category;
import com.tmb.csnerd.demo.repositories.CategoryRepository;
import com.tmb.csnerd.demo.repositories.PostRepository;
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
        return convertToCategoryDTO(categoryRepository.save(category));
    }

    @Transactional
    public CategoryResponseDTO patchCategory(Long categoryId, UpdateCategoryDTO request) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new CatergoryNotFound(categoryId));
        if (category.getName() != null && !category.getName().isEmpty() && !category.getName().equals(request.name())) {
            category.setName(request.name());
            category.setSlugName(SlugifyUtils.slugify(request.name()));
        }
        return convertToCategoryDTO(category);
    }

    @Transactional
    public CategoryResponseDTO putCategory(Long categoryId, ReplaceCategoryDTO request) {
        Category category = categoryRepository.findById(categoryId)
                .orElse(null);
        if (category == null) {
            category = new Category();
            categoryRepository.save(category);
        }
        category.setName(request.name());
        category.setSlugName(SlugifyUtils.slugify(request.name()));
        return convertToCategoryDTO(category);
    }

    @Transactional
    public void deleteCategory(Long categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new CatergoryNotFound(categoryId));
        if (postRepository.existsActiveByCategoryId(categoryId)) {
            throw new ConflictStatusException("Category is used by active posts");
        }
        categoryRepository.delete(category);
    }

    private CategoryResponseDTO convertToCategoryDTO(Category category) {
        return new CategoryResponseDTO(category.getName(), category.getSlugName());
    }
}
