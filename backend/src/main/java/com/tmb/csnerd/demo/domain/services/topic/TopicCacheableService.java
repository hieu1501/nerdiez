package com.tmb.csnerd.demo.domain.services.topic;

import com.github.benmanes.caffeine.cache.LoadingCache;
import com.tmb.csnerd.demo.domain.cache.category.CategoryChangedEvent;
import com.tmb.csnerd.demo.domain.cache.topic.TopicChangedEvent;
import com.tmb.csnerd.demo.dto.common.CachedContent;
import com.tmb.csnerd.demo.dto.topic.adminresponse.TopicAdminDetailDTO;
import com.tmb.csnerd.demo.dto.topic.publicresponse.TopicPublicDetailDTO;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;

@Service
public class TopicCacheableService {
    private final LoadingCache<Long, CachedContent<TopicAdminDetailDTO>> adminTopicListCache;
    private final LoadingCache<Long, CachedContent<TopicPublicDetailDTO>> publicTopicListCache;

    public TopicCacheableService(@Qualifier("adminTopicListCache") LoadingCache<Long, CachedContent<TopicAdminDetailDTO>> adminTopicListCache,
                                 @Qualifier("publicTopicListCache") LoadingCache<Long, CachedContent<TopicPublicDetailDTO>> publicTopicListCache) {
        this.adminTopicListCache = adminTopicListCache;
        this.publicTopicListCache = publicTopicListCache;
    }

    public Map<Long, CachedContent<TopicAdminDetailDTO>> getTopicsForAdminByIds(List<Long> ids) {
        return ids.isEmpty() ? Map.of() : adminTopicListCache.getAll(new LinkedHashSet<>(ids));
    }

    public Map<Long, CachedContent<TopicPublicDetailDTO>> getTopicsForPublicByIds(List<Long> ids) {
        return ids.isEmpty() ? Map.of() : publicTopicListCache.getAll(new LinkedHashSet<>(ids));
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onTopicChanged(TopicChangedEvent event) {
        invalidateTopicList();
    }

    private void invalidateTopicList() {
        publicTopicListCache.invalidateAll();
        adminTopicListCache.invalidateAll();
    }
}
