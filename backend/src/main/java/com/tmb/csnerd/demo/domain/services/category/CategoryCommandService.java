package com.tmb.csnerd.demo.domain.services.category;

import com.tmb.csnerd.demo.domain.cache.category.CategoryChangedEvent;
import com.tmb.csnerd.demo.domain.cache.post.PostListChangedEvent;
import com.tmb.csnerd.demo.domain.services.post.PostQueryService;
import com.tmb.csnerd.demo.dto.category.adminresponse.CategoryAdminDetailDTO;
import com.tmb.csnerd.demo.dto.category.request.CreateCategoryRequestDTO;
import com.tmb.csnerd.demo.dto.category.request.UpdateCategoryRequestDTO;
import com.tmb.csnerd.demo.exceptions.ConflictStatusException;
import com.tmb.csnerd.demo.exceptions.category.CategoryByIdNotFoundException;
import com.tmb.csnerd.demo.domain.models.Category;
import com.tmb.csnerd.demo.domain.repositories.category.CategoryRepository;
import com.tmb.csnerd.demo.utils.SlugifyUtils;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;

@AllArgsConstructor
@Service
public class CategoryCommandService {
    private final CategoryRepository categoryRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final PostQueryService postQueryService;

    @Transactional
    public CategoryAdminDetailDTO createCategory(CreateCategoryRequestDTO request) {
        Category category = new Category();
        category.setName(request.name());
        category.setSlugName(SlugifyUtils.slugify(request.name()));
        category.setDescription(request.description());
        if (request.isActive() != null) category.setIsActive(request.isActive());
        category = categoryRepository.save(category);
        eventPublisher.publishEvent(new CategoryChangedEvent());
        return CategoryAdminDetailDTO.from(category);
    }

    @Transactional
    public CategoryAdminDetailDTO patchCategory(Long categoryId, UpdateCategoryRequestDTO request) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new CategoryByIdNotFoundException(categoryId));
        modifyCategoryIfChanged(category, request.name(), request.description(), request.isActive());
        category = categoryRepository.save(category);
        eventPublisher.publishEvent(new CategoryChangedEvent());
        List<Long> modifiedPostIds = postQueryService.getPostIdsByCategoryId(categoryId);
        if (!modifiedPostIds.isEmpty()) {
            Set<Long> stalePostIds = Set.copyOf(modifiedPostIds);
            eventPublisher.publishEvent(new PostListChangedEvent(stalePostIds));
        }
        return CategoryAdminDetailDTO.from(category);
    }

    @Transactional
    public void softDeleteCategory(Long categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new CategoryByIdNotFoundException(categoryId));
        category.setIsActive(false);
        categoryRepository.save(category);
        eventPublisher.publishEvent(new CategoryChangedEvent());
        List<Long> modifiedPostIds = postQueryService.getPostIdsByCategoryId(categoryId);
        if (!modifiedPostIds.isEmpty()) {
            Set<Long> stalePostIds = Set.copyOf(modifiedPostIds);
            eventPublisher.publishEvent(new PostListChangedEvent(stalePostIds));
        }
    }

    @Transactional
    public void hardDeleteCategory(Long categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new CategoryByIdNotFoundException(categoryId));
        if (postQueryService.existsPostByCategoryId(categoryId)) {
            throw new ConflictStatusException("Category is used by posts");
        }
        categoryRepository.delete(category);
        eventPublisher.publishEvent(new CategoryChangedEvent());
        List<Long> modifiedPostIds = postQueryService.getPostIdsByCategoryId(categoryId);
        if (!modifiedPostIds.isEmpty()) {
            Set<Long> stalePostIds = Set.copyOf(modifiedPostIds);
            eventPublisher.publishEvent(new PostListChangedEvent(stalePostIds));
        }
    }

    private void modifyCategoryIfChanged(Category category, String newName, String newDescription, Boolean newIsActive) {
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
        if (newIsActive != null && !category.getIsActive().equals(newIsActive)) {
            category.setIsActive(newIsActive);
        }
    }
}
