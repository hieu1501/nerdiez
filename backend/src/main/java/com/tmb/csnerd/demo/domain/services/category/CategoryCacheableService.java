package com.tmb.csnerd.demo.domain.services.category;

import com.github.benmanes.caffeine.cache.LoadingCache;
import com.tmb.csnerd.demo.domain.cache.category.CategoryChangedEvent;
import com.tmb.csnerd.demo.dto.category.adminresponse.CategoryAdminDetailDTO;
import com.tmb.csnerd.demo.dto.category.publicresponse.CategoryPublicDetailDTO;
import com.tmb.csnerd.demo.dto.common.CachedContent;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.util.List;

@Service
public class CategoryCacheableService {
    private final LoadingCache<String, CachedContent<List<CategoryAdminDetailDTO>>> adminCategoryListCache;
    private final LoadingCache<String, CachedContent<List<CategoryPublicDetailDTO>>> publicCategoryListCache;

    public CategoryCacheableService(@Qualifier("adminCategoryListCache") LoadingCache<String, CachedContent<List<CategoryAdminDetailDTO>>> adminCategoryListCache,
                                @Qualifier("publicCategoryListCache") LoadingCache<String, CachedContent<List<CategoryPublicDetailDTO>>> publicCategoryListCache) {
        this.adminCategoryListCache = adminCategoryListCache;
        this.publicCategoryListCache = publicCategoryListCache;
    }

    public CachedContent<List<CategoryAdminDetailDTO>> getAdminAllCategoryList() {
        return adminCategoryListCache.get("all");
    }

    public CachedContent<List<CategoryPublicDetailDTO>> getPublicAllCategoryList() {
        return publicCategoryListCache.get("all");
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onCategoryChanged(CategoryChangedEvent event) {
        invalidateCategoryList();
    }

    private void invalidateCategoryList() {
        adminCategoryListCache.invalidate("all");
        publicCategoryListCache.invalidate("all");
    }
}
