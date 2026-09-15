package com.tmb.csnerd.demo.domain.services.talk;

import com.tmb.csnerd.demo.domain.repositories.talk.TalkRepository;
import com.tmb.csnerd.demo.domain.security.UserPrincipal;
import com.tmb.csnerd.demo.domain.services.fingerprint.FingerprintService;
import com.tmb.csnerd.demo.domain.services.vote.VoteService;
import com.tmb.csnerd.demo.dto.VoteStatsDTO;
import com.tmb.csnerd.demo.dto.common.CachedContent;
import com.tmb.csnerd.demo.dto.common.ETagResponse;
import com.tmb.csnerd.demo.dto.talk.adminresponse.AdminTalkContentDTO;
import com.tmb.csnerd.demo.dto.talk.adminresponse.AdminTalkDTO;
import com.tmb.csnerd.demo.dto.talk.publicresponse.PersonalTalkContentDTO;
import com.tmb.csnerd.demo.dto.talk.publicresponse.PublicTalkContentDTO;
import com.tmb.csnerd.demo.dto.talk.publicresponse.PublicTalkDTO;
import com.tmb.csnerd.demo.domain.services.cache.ETagFactory;
import com.tmb.csnerd.demo.exceptions.UnauthorizedException;
import com.tmb.csnerd.demo.utils.PageableUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.domain.SliceImpl;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class TalkQueryService {
    private final TalkRepository talkRepository;
    private final TalkCacheableService talkCacheableService;
    private final VoteService voteService;
    private final FingerprintService fingerprintService;
    private final ETagFactory eTagFactory;
    private final PageableUtils pageableUtils;
    private final TalkContentLoader talkContentLoader;

    public ETagResponse<Slice<PublicTalkDTO>> getTalksSliceByTopicPublicUri(String topicPublicUri, UserPrincipal viewer, Pageable pageable) {
        Slice<Long> ids = talkRepository.getActiveTalkIdsByTopicPublicUri(topicPublicUri, pageable);
        List<String> componentsForETag = pageableUtils.getRepresentationForSlice("public-talk-slice:v1", pageable, ids);
        if (ids.isEmpty()) {
            String eTag = eTagFactory.weakETag(componentsForETag.toArray(String[]::new));
            return ETagResponse.from(new SliceImpl<>(Collections.emptyList(), pageable, ids.hasNext()), eTag);
        }
        Map<Long, CachedContent<PublicTalkContentDTO>> contents = talkCacheableService.getPublicContentByIds(ids.getContent());
        Map<Long, VoteStatsDTO> votes = voteService.getTalkVoteInformationByTalkIds(ids.getContent());
        Map<Long, Byte> votesByUser = viewer != null ? voteService.getTalkVoteByTalkIdsForUser(ids.getContent(), viewer.getUser().getId()) : Map.of();
        List<PublicTalkDTO> result = new ArrayList<>();
        for (Long id : ids.getContent()) {
            CachedContent<PublicTalkContentDTO> content = contents.get(id);
            VoteStatsDTO vote = votes.get(id);
            Byte voteByUser = votesByUser.getOrDefault(id, null);
            if (content == null || vote == null) continue;
            String voteStatsFingerprint = fingerprintService.fingerprint(vote.getFingerprintData());
            result.add(new PublicTalkDTO(content.content(), vote, voteByUser));
            // ETag computation
            componentsForETag.add("id:" + id);
            componentsForETag.add("content:" + content.fingerprint());
            componentsForETag.add("votes:" + voteStatsFingerprint);
        }
        String eTag = eTagFactory.weakETag(componentsForETag.toArray(String[]::new));
        return ETagResponse.from(new SliceImpl<>(result, pageable, ids.hasNext()), eTag);
    }

    public ETagResponse<Slice<PersonalTalkContentDTO>> getTalksSliceForProfile(String topicPublicUri, UserPrincipal userPrincipal, Pageable pageable) {
        requireAuthenticated(userPrincipal);
        Slice<Long> ids = talkRepository.getTalksForProfileInSlice(topicPublicUri, userPrincipal.getUser().getId(), pageable);
        List<String> componentsForETag = pageableUtils.getRepresentationForSlice("profile-talk-slice:v1", pageable, ids);
        componentsForETag.add("user:" + userPrincipal.getUser().getId());
        if (ids.isEmpty()) {
            String eTag = eTagFactory.weakETag(componentsForETag.toArray(String[]::new));
            return ETagResponse.from(new SliceImpl<>(Collections.emptyList(), pageable, ids.hasNext()), eTag);
        }
        Map<Long, CachedContent<PersonalTalkContentDTO>> contents = talkContentLoader.loadProfileContentByIds(Set.copyOf(ids.getContent()));
        List<PersonalTalkContentDTO> result = new ArrayList<>();
        for (Long id : ids.getContent()) {
            CachedContent<PersonalTalkContentDTO> content = contents.get(id);
            if (content == null) continue;
            result.add(content.content());
            // ETag computation
            componentsForETag.add("id:" + id);
            componentsForETag.add("content:" + content.fingerprint());
        }
        String eTag = eTagFactory.weakETag(componentsForETag.toArray(String[]::new));
        return ETagResponse.from(new SliceImpl<>(result, pageable, ids.hasNext()), eTag);
    }

    public ETagResponse<Page<AdminTalkDTO>> getTalksForAdmin(Long topicId, Pageable pageable) {
        Page<Long> ids = talkRepository.getTalkIdsForAdmin(topicId, pageable);
        List<String> componentsForETag = pageableUtils.getRepresentationForPage("admin-talk-page:v1", pageable, ids);
        if (ids.isEmpty()) {
            String eTag = eTagFactory.weakETag(componentsForETag.toArray(String[]::new));
            return ETagResponse.from(new PageImpl<>(Collections.emptyList(), pageable, ids.getTotalElements()), eTag);
        }
        Map<Long, CachedContent<AdminTalkContentDTO>> contents = talkCacheableService.getAdminContentByIds(ids.getContent());
        Map<Long, VoteStatsDTO> votes = voteService.getTalkVoteInformationByTalkIds(ids.getContent());
        List<AdminTalkDTO> result = new ArrayList<>();
        for (Long id : ids.getContent()) {
            CachedContent<AdminTalkContentDTO> content = contents.get(id);
            VoteStatsDTO vote = votes.get(id);
            if (content == null || vote == null) continue;
            String voteStatsFingerprint = fingerprintService.fingerprint(vote.getFingerprintData());
            result.add(new AdminTalkDTO(content.content(), vote));
            componentsForETag.add("id:" + id);
            componentsForETag.add("content:" + content.fingerprint());
            componentsForETag.add("votes:" + voteStatsFingerprint);
        }
        String eTag = eTagFactory.weakETag(componentsForETag.toArray(String[]::new));
        return ETagResponse.from(new PageImpl<>(result, pageable, ids.getTotalElements()), eTag);
    }

    private void requireAuthenticated(UserPrincipal principal) {
        if (principal == null) throw new UnauthorizedException(HttpStatus.UNAUTHORIZED);
    }
}
