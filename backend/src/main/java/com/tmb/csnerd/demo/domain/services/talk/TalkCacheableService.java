package com.tmb.csnerd.demo.domain.services.talk;

import com.github.benmanes.caffeine.cache.LoadingCache;
import com.tmb.csnerd.demo.domain.cache.talk.TalkChangedEvent;
import com.tmb.csnerd.demo.domain.cache.talk.TalkListChangedEvent;
import com.tmb.csnerd.demo.dto.common.CachedContent;
import com.tmb.csnerd.demo.dto.talk.adminresponse.AdminTalkContentDTO;
import com.tmb.csnerd.demo.dto.talk.publicresponse.PublicTalkContentDTO;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;

@Service
public class TalkCacheableService {
    private final LoadingCache<Long, CachedContent<AdminTalkContentDTO>> adminTalksCache;
    private final LoadingCache<Long, CachedContent<PublicTalkContentDTO>> publicTalksCache;

    public TalkCacheableService(
        @Qualifier("adminTalksCache") LoadingCache<Long, CachedContent<AdminTalkContentDTO>> adminTalksCache,
        @Qualifier("publicTalksCache") LoadingCache<Long, CachedContent<PublicTalkContentDTO>> publicTalksCache
    ) {
        this.adminTalksCache = adminTalksCache;
        this.publicTalksCache = publicTalksCache;
    }

    public Map<Long, CachedContent<AdminTalkContentDTO>> getAdminContentByIds(List<Long> ids) {
        return ids.isEmpty() ? Map.of() : adminTalksCache.getAll(new LinkedHashSet<>(ids));
    }

    public Map<Long, CachedContent<PublicTalkContentDTO>> getPublicContentByIds(List<Long> ids) {
        return ids.isEmpty() ? Map.of() : publicTalksCache.getAll(new LinkedHashSet<>(ids));
    }


    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onTalkChanged(TalkChangedEvent event) {
        invalidate(event.talkId());
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onTalkListChanged(TalkListChangedEvent event) {
        invalidateAll(event.talkIds());
    }

    private void invalidate(Long id) {
        adminTalksCache.invalidate(id);
        publicTalksCache.invalidate(id);
    }

    private void invalidateAll(Collection<Long> ids) {
        adminTalksCache.invalidateAll(ids);
        publicTalksCache.invalidateAll(ids);
    }
}
