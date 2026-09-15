package com.tmb.csnerd.demo.domain.services.tag;

import com.github.benmanes.caffeine.cache.LoadingCache;
import com.tmb.csnerd.demo.domain.cache.tag.TagChangedEvent;
import com.tmb.csnerd.demo.domain.cache.tag.TagDetailsForAdminChangedEvent;
import com.tmb.csnerd.demo.domain.services.fingerprint.FingerprintDataList;
import com.tmb.csnerd.demo.domain.services.fingerprint.FingerprintService;
import com.tmb.csnerd.demo.domain.services.fingerprint.IFingerprintData;
import com.tmb.csnerd.demo.dto.common.CachedContent;
import com.tmb.csnerd.demo.dto.tag.adminresponse.TagAdminDetailDTO;
import com.tmb.csnerd.demo.dto.tag.publicresponse.TagPublicDetailDTO;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.util.List;
import java.util.Map;

@Service
public class TagCacheableService {
    private final FingerprintService fingerprintService;
    private final LoadingCache<String, List<TagAdminDetailDTO>> adminTagListCache;
    private final LoadingCache<String, List<TagPublicDetailDTO>> publicTagListCache;

    public TagCacheableService(@Qualifier("adminTagListCache") LoadingCache<String, List<TagAdminDetailDTO>> adminTagListCache,
                               @Qualifier("publicTagListCache") LoadingCache<String, List<TagPublicDetailDTO>> publicTagListCache,
                               FingerprintService fingerprintService) {
        this.adminTagListCache = adminTagListCache;
        this.publicTagListCache = publicTagListCache;
        this.fingerprintService = fingerprintService;
    }

    public CachedContent<List<TagAdminDetailDTO>> getTagsListForAdmin() {
        List<TagAdminDetailDTO> allTags = adminTagListCache.get("all");
        IFingerprintData fingerprint = new FingerprintDataList("admin-tag-list", allTags.stream().map(TagAdminDetailDTO::getFingerprintData).toList());
        return new CachedContent<>(allTags, fingerprintService.fingerprint(fingerprint));
    }

    public CachedContent<List<TagPublicDetailDTO>> getTagsListForPublic() {
        List<TagPublicDetailDTO> allActiveTags = publicTagListCache.get("all");
        IFingerprintData fingerprint = new FingerprintDataList("public-tag-list", allActiveTags.stream().map(TagPublicDetailDTO::getFingerprintData).toList());
        return new CachedContent<>(allActiveTags, fingerprintService.fingerprint(fingerprint));
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onTagChanged(TagChangedEvent event) {
        invalidateTagList();
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onTagDetailsForAdminChanged(TagDetailsForAdminChangedEvent event) {
        invalidateAdminTagList();
    }

    private void invalidateAdminTagList() {
        adminTagListCache.invalidateAll();
    }

    private void invalidateTagList() {
        adminTagListCache.invalidateAll();
        publicTagListCache.invalidateAll();
    }
}
