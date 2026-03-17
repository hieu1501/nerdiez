package com.tmb.csnerd.demo.service.category;

import com.tmb.csnerd.demo.dto.category.CategoryResponseDTO;
import com.tmb.csnerd.demo.dto.category.CreateCategoryDTO;
import com.tmb.csnerd.demo.dto.category.ReplaceCategoryDTO;
import com.tmb.csnerd.demo.dto.category.UpdateCategoryDTO;
import com.tmb.csnerd.demo.exception.ConflictStatusException;
import com.tmb.csnerd.demo.exception.UnauthorizedException;
import com.tmb.csnerd.demo.exception.category.CatergoryNotFound;
import com.tmb.csnerd.demo.exception.topic.TopicNotFound;
import com.tmb.csnerd.demo.model.Category;
import com.tmb.csnerd.demo.model.Topic;
import com.tmb.csnerd.demo.model.User;
import com.tmb.csnerd.demo.repository.CategoryRepository;
import com.tmb.csnerd.demo.repository.PostRepository;
import com.tmb.csnerd.demo.repository.UserRepository;
import com.tmb.csnerd.demo.utils.SlugifyUtil;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@AllArgsConstructor
@Service
public class CategoryCommandService {
    private final CategoryRepository categoryRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    @Transactional
    public CategoryResponseDTO createCategory(CreateCategoryDTO request) {
        Category category = new Category();
        category.setName(request.name());
        category.setSlugName(SlugifyUtil.slugify(request.name()));
        return convertToCategoryDTO(categoryRepository.save(category));
    }

    @Transactional
    public CategoryResponseDTO patchCategory(Integer categoryId, UpdateCategoryDTO request) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new CatergoryNotFound(categoryId));
        if (category.getName() != null && !category.getName().isEmpty() && !category.getName().equals(request.name())) {
            category.setName(request.name());
            category.setSlugName(SlugifyUtil.slugify(request.name()));
        }
        return convertToCategoryDTO(category);
    }

    @Transactional
    public CategoryResponseDTO putCategory(Integer categoryId, ReplaceCategoryDTO request) {
        Category category = categoryRepository.findById(categoryId)
                .orElse(null);
        if (category == null) {
            category = new Category();
            categoryRepository.save(category);
        }
        category.setName(request.name());
        category.setSlugName(SlugifyUtil.slugify(request.name()));
        return convertToCategoryDTO(category);
    }

    @Transactional
    public void deleteCategory(Integer categoryId) {
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
