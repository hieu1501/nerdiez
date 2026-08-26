package com.tmb.csnerd.demo.domain.services.category;

import com.tmb.csnerd.demo.domain.repositories.category.CategoryRepository;
import com.tmb.csnerd.demo.domain.services.fingerprint.FingerprintDataList;
import com.tmb.csnerd.demo.domain.services.fingerprint.FingerprintService;
import com.tmb.csnerd.demo.dto.category.adminresponse.CategoryAdminDetailDTO;
import com.tmb.csnerd.demo.dto.category.publicresponse.CategoryPublicDetailDTO;
import com.tmb.csnerd.demo.dto.common.CachedContent;
import lombok.RequiredArgsConstructor;
import org.hibernate.Cache;
import org.springframework.stereotype.Component;

import java.util.List;

@RequiredArgsConstructor
@Component
public class CategoryContentLoader {
    private final CategoryRepository categoryRepository;
    private final FingerprintService fingerprintService;

    public CachedContent<List<CategoryAdminDetailDTO>> loadAllCategoriesForAdmin() {
        List<CategoryAdminDetailDTO> allCategories = categoryRepository.findAll().stream().map(CategoryAdminDetailDTO::from).toList();
        String fingerprint = fingerprintService.fingerprint(
                new FingerprintDataList(
                    "admin-category-list",
                        allCategories.stream().map(CategoryAdminDetailDTO::getFingerprintData).toList()
                ));
        return new CachedContent<>(allCategories, fingerprint);
    }

    public CachedContent<List<CategoryPublicDetailDTO>> loadAllCategoriesForPublic() {
        List<CategoryPublicDetailDTO> allCategories = categoryRepository.getAllActiveCategories().stream().map(CategoryPublicDetailDTO::from).toList();
        String fingerprint = fingerprintService.fingerprint(
                new FingerprintDataList(
                        "public-category-list",
                        allCategories.stream().map(CategoryPublicDetailDTO::getFingerprintData).toList()
                ));
        return new CachedContent<>(allCategories, fingerprint);
    }
}
