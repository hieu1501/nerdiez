package com.tmb.csnerd.demo.domain.services.category;

import com.tmb.csnerd.demo.domain.models.Category;
import com.tmb.csnerd.demo.domain.repositories.category.CategoryRepository;
import com.tmb.csnerd.demo.dto.category.adminresponse.CategoryAdminDetailDTO;
import com.tmb.csnerd.demo.dto.category.publicresponse.CategoryPublicDetailDTO;
import com.tmb.csnerd.demo.dto.common.CachedContent;
import com.tmb.csnerd.demo.dto.common.ETagResponse;
import com.tmb.csnerd.demo.exceptions.category.CategoryByIdNotFoundException;
import com.tmb.csnerd.demo.utils.ETagFactory;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@AllArgsConstructor
@Service
public class CategoryQueryService {
    private final CategoryCacheableService categoryCacheableService;
    private final CategoryRepository categoryRepository;
    private final ETagFactory eTagFactory;

    public ETagResponse<List<CategoryAdminDetailDTO>> getAllCategoriesForAdmin() {
        CachedContent<List<CategoryAdminDetailDTO>> listContent = categoryCacheableService.getAdminAllCategoryList();
        List<String> componentsForETag = new ArrayList<>();
        componentsForETag.add("admin-category-list:v1");
        componentsForETag.add(listContent.fingerprint());
        String eTag = eTagFactory.weakETag(componentsForETag.toArray(String[]::new));
        return ETagResponse.from(listContent.content(), eTag);
    }

    public ETagResponse<List<CategoryPublicDetailDTO>> getAllCategoriesForPublic() {
        CachedContent<List<CategoryPublicDetailDTO>> listContent = categoryCacheableService.getPublicAllCategoryList();
        List<String> componentsForETag = new ArrayList<>();
        componentsForETag.add("public-category-list:v1");
        componentsForETag.add(listContent.fingerprint());
        String eTag = eTagFactory.weakETag(componentsForETag.toArray(String[]::new));
        return ETagResponse.from(listContent.content(), eTag);
    }

    public List<Long> getAllActiveCategoryIds() {
        return categoryRepository.getAllActiveCategoryIds();
    }

    public List<Long> getAllCategoryIds() {
        return categoryRepository.getAllCategoryIds();
    }

    public Category getCategoryById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new CategoryByIdNotFoundException(id));
    }
}
