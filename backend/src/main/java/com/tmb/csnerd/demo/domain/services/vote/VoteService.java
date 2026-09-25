package com.tmb.csnerd.demo.domain.services.vote;

import com.tmb.csnerd.demo.domain.cache.vote.PostVoteChangedEvent;
import com.tmb.csnerd.demo.domain.cache.vote.TalkVoteChangedEvent;
import com.tmb.csnerd.demo.domain.repositories.post.PostRepository;
import com.tmb.csnerd.demo.domain.repositories.postvote.projections.PostVotesInformationProjection;
import com.tmb.csnerd.demo.domain.repositories.postvote.PostVoteRepository;
import com.tmb.csnerd.demo.domain.repositories.talk.TalkRepository;
import com.tmb.csnerd.demo.domain.repositories.talkvote.projections.TalkVotesInformationProjection;
import com.tmb.csnerd.demo.domain.repositories.talkvote.TalkVoteRepository;
import com.tmb.csnerd.demo.domain.security.UserPrincipal;
import com.tmb.csnerd.demo.dto.VoteStatsDTO;
import com.tmb.csnerd.demo.dto.postvote.PostVoteResponseDTO;
import com.tmb.csnerd.demo.dto.talkvote.TalkVoteResponseDTO;
import com.tmb.csnerd.demo.exceptions.UnauthorizedException;
import com.tmb.csnerd.demo.exceptions.post.PostByPublicUriNotFoundException;
import com.tmb.csnerd.demo.exceptions.talk.TalkByPublicUriNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class VoteService {
    private final PostVoteRepository postVoteRepository;
    private final TalkVoteRepository talkVoteRepository;
    private final PostRepository postRepository;
    private final TalkRepository talkRepository;
    private final VoteCacheableService voteCacheableService;
    private final ApplicationEventPublisher eventPublisher;
    private final VoteContentLoader voteContentLoader;
    public final VoteStatsDTO DEFAULT_VOTE_STATS = VoteStatsDTO.from(0L, 0L, 1L);

    public VoteStatsDTO getPostVoteInformationByPostId(Long postId) {
        return voteCacheableService.getPostVoteInformationByPostId(postId).orElse(DEFAULT_VOTE_STATS);
    }

    public VoteStatsDTO getTalkVoteInformationByTalkId(Long talkId) {
        return voteCacheableService.getTalkVoteInformationByTalkId(talkId).orElse(DEFAULT_VOTE_STATS);
    }

    public Map<Long, VoteStatsDTO> getPostVoteInformationByPostIds(List<Long> postIds) {
        Map<Long, VoteStatsDTO> voteStatsMap = voteCacheableService.getPostVoteInformationByPostIds(Set.copyOf(postIds));
        Map<Long, VoteStatsDTO> resultMap = new HashMap<>();
        for (Long id : postIds) {
            VoteStatsDTO voteStat = voteStatsMap.getOrDefault(id, DEFAULT_VOTE_STATS);
            resultMap.put(id, voteStat);
        }
        return resultMap;
    }

    public Map<Long, VoteStatsDTO> getTalkVoteInformationByTalkIds(List<Long> talkIds) {
        Map<Long, VoteStatsDTO> voteStatsMap = voteCacheableService.getTalkVoteInformationByTalkIds(Set.copyOf(talkIds));
        Map<Long, VoteStatsDTO> resultMap = new HashMap<>();
        for (Long id : talkIds) {
            VoteStatsDTO voteStat = voteStatsMap.getOrDefault(id, DEFAULT_VOTE_STATS);
            resultMap.put(id, voteStat);
        }
        return resultMap;
    }

    public Map<Long, Byte> getTalkVoteByTalkIdsForUser(List<Long> talkIds, Long userId) {
        Map<Long, Byte> voteStatsMap = voteContentLoader.loadTalkVoteByTalkIdsForUser(Set.copyOf(talkIds), userId);
        Map<Long, Byte> resultMap = new HashMap<>();
        for (Long id : talkIds) {
            Byte vote = voteStatsMap.getOrDefault(id, null);
            resultMap.put(id, vote);
        }
        return resultMap;
    }


    public VoteStatsDTO getPostVoteInformationByPublicUri(String publicUri) {
        Long postId = postRepository.getActivePostIdByPublicUri(publicUri).orElseThrow(() -> new PostByPublicUriNotFoundException(publicUri));
        return getPostVoteInformationByPostId(postId);
    }

    public Byte getVoteForPostByUserId(Long postId, Long userId) {
        return postVoteRepository.getVoteForPostByUserId(postId, userId).orElse(null);
    }

    public Byte getVoteForTalkByUserId(Long talkId, Long userId) {
        return talkVoteRepository.getVoteForTalkByUser(talkId, userId).orElse(null);
    }

    @Transactional
    public PostVoteResponseDTO setPostVoteByPublicUri(String publicUri, UserPrincipal user, Byte vote) {
        requireAuthenticated(user);
        Long postId = postRepository.getActivePostIdByPublicUri(publicUri).orElseThrow(() -> new PostByPublicUriNotFoundException(publicUri));
        int rowAffected = postVoteRepository.upsertVote(postId, user.getUser().getId(), vote);
        eventPublisher.publishEvent(new PostVoteChangedEvent(postId));
        PostVotesInformationProjection fresh = postVoteRepository.getPostVoteInformationById(postId).orElseThrow(() -> new PostByPublicUriNotFoundException(publicUri));
        VoteStatsDTO voteStats = VoteStatsDTO.from(fresh.getUpvoteCount(), fresh.getDownvoteCount(), fresh.getVoteVersion());
        return new PostVoteResponseDTO(publicUri, vote, voteStats);
    }

    @Transactional
    public TalkVoteResponseDTO setTalkVoteByPublicUri(String publicUri, UserPrincipal user, Byte vote) {
        requireAuthenticated(user);
        Long talkId = talkRepository.getActiveTalkIdByPublicUri(publicUri).orElseThrow(() -> new TalkByPublicUriNotFoundException(publicUri));
        int rowAffected = talkVoteRepository.upsertVote(talkId, user.getUser().getId(), vote);
        eventPublisher.publishEvent(new TalkVoteChangedEvent(talkId));
        TalkVotesInformationProjection fresh = talkVoteRepository.getTalkVoteInformationById(talkId).orElseThrow(() -> new TalkByPublicUriNotFoundException(publicUri));
        VoteStatsDTO voteStats = VoteStatsDTO.from(fresh.getUpvoteCount(), fresh.getDownvoteCount(), fresh.getVoteVersion());
        return new TalkVoteResponseDTO(publicUri, vote, voteStats);
    }

    private void requireAuthenticated(UserPrincipal principal) {
        if (principal == null) throw new UnauthorizedException(HttpStatus.UNAUTHORIZED);
    }
}
