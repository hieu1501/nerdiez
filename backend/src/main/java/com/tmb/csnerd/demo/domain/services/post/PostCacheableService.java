package com.tmb.csnerd.demo.domain.services.post;

import com.github.benmanes.caffeine.cache.LoadingCache;
import com.tmb.csnerd.demo.domain.cache.post.PostChangedEvent;
import com.tmb.csnerd.demo.domain.cache.post.PostListChangedEvent;
import com.tmb.csnerd.demo.domain.repositories.post.projections.*;
import com.tmb.csnerd.demo.dto.common.CachedContent;
import com.tmb.csnerd.demo.dto.post.adminresponse.AdminPostBriefContentDTO;
import com.tmb.csnerd.demo.dto.post.adminresponse.AdminPostDetailContentDTO;
import com.tmb.csnerd.demo.dto.post.publicresponse.PublicPostBriefContentDTO;
import com.tmb.csnerd.demo.dto.post.publicresponse.PublicPostDetailContentDTO;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.util.*;

@Service
public class PostCacheableService {
    private final LoadingCache<Long, CachedContent<AdminPostBriefContentDTO>> adminPostListCache;
    private final LoadingCache<Long, CachedContent<PublicPostBriefContentDTO>> publicPostListCache;
    private final LoadingCache<Long, CachedContent<AdminPostDetailContentDTO>> adminPostDetailCache;
    private final LoadingCache<Long, CachedContent<PublicPostDetailContentDTO>> publicPostDetailCache;

    public PostCacheableService(@Qualifier("adminPostListCache") LoadingCache<Long, CachedContent<AdminPostBriefContentDTO>> adminPostListCache,
                                @Qualifier("publicPostListCache") LoadingCache<Long, CachedContent<PublicPostBriefContentDTO>> publicPostListCache,
                                @Qualifier("adminPostDetailCache") LoadingCache<Long, CachedContent<AdminPostDetailContentDTO>> adminPostDetailCache,
                                @Qualifier("publicPostDetailCache") LoadingCache<Long, CachedContent<PublicPostDetailContentDTO>> publicPostDetailCache) {
        this.adminPostListCache = adminPostListCache;
        this.publicPostListCache = publicPostListCache;
        this.adminPostDetailCache = adminPostDetailCache;
        this.publicPostDetailCache = publicPostDetailCache;
    }

    public Map<Long, CachedContent<AdminPostBriefContentDTO>> getAdminPostBriefContentByPostIds(List<Long> ids) {
        return ids.isEmpty() ? Map.of() : adminPostListCache.getAll(new LinkedHashSet<>(ids));
    }

    public Map<Long, CachedContent<PublicPostBriefContentDTO>> getPostBriefContentByPostIds(List<Long> ids) {
        return ids.isEmpty() ? Map.of() : publicPostListCache.getAll(new LinkedHashSet<>(ids));
    }

    public CachedContent<AdminPostDetailContentDTO> findAdminPostDetailContentById(Long id) {
        return adminPostDetailCache.get(id);
    }

    public CachedContent<PublicPostDetailContentDTO> findPublicPostDetailContentById(Long id) {
        return publicPostDetailCache.get(id);
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onPostChanged(PostChangedEvent event) {
        invalidatePost(event.postId());
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onPostListChanged(PostListChangedEvent event) {
        invalidatePosts(event.postIds());
    }

    private void invalidatePost(Long postId) {
        adminPostListCache.invalidate(postId);
        publicPostListCache.invalidate(postId);
        adminPostDetailCache.invalidate(postId);
        publicPostDetailCache.invalidate(postId);
    }

    private void invalidatePosts(Collection<Long> postIds) {
        adminPostListCache.invalidateAll(postIds);
        publicPostListCache.invalidateAll(postIds);
        adminPostDetailCache.invalidateAll(postIds);
        publicPostDetailCache.invalidateAll(postIds);
    }

    private void invalidateAllPosts() {
        adminPostListCache.invalidateAll();
        publicPostListCache.invalidateAll();
        adminPostDetailCache.invalidateAll();
        publicPostDetailCache.invalidateAll();
    }
}
