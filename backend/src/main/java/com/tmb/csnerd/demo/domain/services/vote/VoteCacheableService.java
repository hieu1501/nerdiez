package com.tmb.csnerd.demo.domain.services.vote;

import com.github.benmanes.caffeine.cache.LoadingCache;
import com.tmb.csnerd.demo.domain.cache.vote.PostVoteChangedEvent;
import com.tmb.csnerd.demo.domain.cache.vote.TalkVoteChangedEvent;
import com.tmb.csnerd.demo.dto.VoteStatsDTO;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.util.Map;
import java.util.Optional;
import java.util.Set;

@Service
public class VoteCacheableService {
    private final LoadingCache<Long, VoteStatsDTO> postVoteCache;
    private final LoadingCache<Long, VoteStatsDTO> talkVoteCache;

    public VoteCacheableService(@Qualifier("postVoteCache") LoadingCache<Long, VoteStatsDTO> postVoteCache,
                                @Qualifier("talkVoteCache") LoadingCache<Long, VoteStatsDTO> talkVoteCache)  {
        this.postVoteCache = postVoteCache;
        this.talkVoteCache = talkVoteCache;
    }

    public Optional<VoteStatsDTO> getPostVoteInformationByPostId(Long id) {
        return Optional.of(postVoteCache.get(id));
    }

    public Map<Long, VoteStatsDTO> getPostVoteInformationByPostIds(Set<Long> ids) {
        return postVoteCache.getAll(ids);
    }

    public Optional<VoteStatsDTO> getTalkVoteInformationByTalkId(Long id) {
        return Optional.of(talkVoteCache.get(id));
    }

    public Map<Long, VoteStatsDTO> getTalkVoteInformationByTalkIds(Set<Long> ids) {
        return talkVoteCache.getAll(ids);
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onPostVoteChanged(PostVoteChangedEvent event) {
        invalidatePostCache(event.postId());
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onTalkVoteChanged(TalkVoteChangedEvent event) {
        invalidateTalkCache(event.talkId());
    }

    private void invalidatePostCache(Long postId) {
        postVoteCache.invalidate(postId);
    }

    private void invalidatePostCacheAll() {
        postVoteCache.invalidateAll();
    }

    private void invalidateTalkCache(Long talkId) {
        talkVoteCache.invalidate(talkId);
    }

    private void invalidateTalkCacheAll() {
        talkVoteCache.invalidateAll();
    }
}
