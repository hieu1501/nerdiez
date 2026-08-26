package com.tmb.csnerd.demo.domain.services.topic;

import com.github.benmanes.caffeine.cache.LoadingCache;
import com.tmb.csnerd.demo.domain.cache.category.CategoryChangedEvent;
import com.tmb.csnerd.demo.domain.cache.topic.TopicChangedEvent;
import com.tmb.csnerd.demo.domain.services.fingerprint.FingerprintDataList;
import com.tmb.csnerd.demo.domain.services.fingerprint.FingerprintService;
import com.tmb.csnerd.demo.domain.services.fingerprint.IFingerprintData;
import com.tmb.csnerd.demo.dto.category.adminresponse.CategoryAdminDetailDTO;
import com.tmb.csnerd.demo.dto.category.publicresponse.CategoryPublicDetailDTO;
import com.tmb.csnerd.demo.dto.common.CachedContent;
import com.tmb.csnerd.demo.dto.topic.adminresponse.TopicAdminDetailDTO;
import com.tmb.csnerd.demo.dto.topic.publicresponse.TopicPublicDetailDTO;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;

@Service
public class TopicCacheableService {
    private final FingerprintService fingerprintService;
    private final LoadingCache<Long, List<TopicAdminDetailDTO>> adminTopicListCache;
    private final LoadingCache<Long, List<TopicPublicDetailDTO>> publicTopicListCache;

    public TopicCacheableService(@Qualifier("adminTopicListCache") LoadingCache<Long, List<TopicAdminDetailDTO>> adminTopicListCache,
                                 @Qualifier("publicTopicListCache") LoadingCache<Long, List<TopicPublicDetailDTO>> publicTopicListCache,
                                 FingerprintService fingerprintService) {
        this.adminTopicListCache = adminTopicListCache;
        this.publicTopicListCache = publicTopicListCache;
        this.fingerprintService = fingerprintService;
    }

    public CachedContent<List<TopicAdminDetailDTO>> getAdminTopicListByCategoryIds(List<Long> categoryIds) {
        if (categoryIds.isEmpty()) {
            return new CachedContent<>(List.of(), "topics-empty");
        }
        Map<Long, List<TopicAdminDetailDTO>> topicsMappedByCategoryId = adminTopicListCache.getAll(categoryIds);
        List<TopicAdminDetailDTO> topicAdminList = topicsMappedByCategoryId.values().stream().flatMap(List::stream).toList();
        IFingerprintData fingerprint = new FingerprintDataList("admin-topic-list", topicAdminList.stream().map(TopicAdminDetailDTO::getFingerprintData).toList());
        return new CachedContent<>(topicAdminList, fingerprintService.fingerprint(fingerprint));
    }

    public CachedContent<List<TopicPublicDetailDTO>> getPublicTopicListByCategoryIds(List<Long> categoryIds) {
        if (categoryIds.isEmpty()) {
            return new CachedContent<>(List.of(), "topics-empty");
        }
        Map<Long, List<TopicPublicDetailDTO>> topicsMappedByCategoryId = publicTopicListCache.getAll(categoryIds);
        List<TopicPublicDetailDTO> topicPublicList = topicsMappedByCategoryId.values().stream().flatMap(List::stream).toList();
        IFingerprintData fingerprint = new FingerprintDataList("public-topic-list", topicPublicList.stream().map(TopicPublicDetailDTO::getFingerprintData).toList());
        return new CachedContent<>(topicPublicList, fingerprintService.fingerprint(fingerprint));
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onTopicChanged(TopicChangedEvent event) {
        invalidateTopicList();
    }

    private void invalidateTopicListByCategoryId(Long categoryId) {
        adminTopicListCache.invalidate(categoryId);
        publicTopicListCache.invalidate(categoryId);
    }

    private void invalidateTopicList() {
        adminTopicListCache.invalidateAll();
        publicTopicListCache.invalidateAll();
    }
}
