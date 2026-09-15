package com.tmb.csnerd.demo.domain.services.post;

import com.tmb.csnerd.demo.domain.security.UserPrincipal;
import com.tmb.csnerd.demo.domain.services.fingerprint.FingerprintService;
import com.tmb.csnerd.demo.domain.services.publicuri.PublicResourceUriFactory;
import com.tmb.csnerd.demo.domain.services.vote.VoteService;
import com.tmb.csnerd.demo.dto.common.CachedContent;
import com.tmb.csnerd.demo.dto.common.ETagResponse;
import com.tmb.csnerd.demo.dto.VoteStatsDTO;
import com.tmb.csnerd.demo.dto.post.adminresponse.AdminPostBriefContentDTO;
import com.tmb.csnerd.demo.dto.post.adminresponse.AdminPostBriefDTO;
import com.tmb.csnerd.demo.dto.post.adminresponse.AdminPostDetailContentDTO;
import com.tmb.csnerd.demo.dto.post.adminresponse.AdminPostDetailDTO;
import com.tmb.csnerd.demo.dto.post.publicresponse.*;
import com.tmb.csnerd.demo.domain.repositories.post.PostRepository;
import com.tmb.csnerd.demo.exceptions.UnauthorizedException;
import com.tmb.csnerd.demo.exceptions.post.PostByIdNotFoundException;
import com.tmb.csnerd.demo.exceptions.post.PostByPublicUriNotFoundException;
import com.tmb.csnerd.demo.domain.services.cache.ETagFactory;
import com.tmb.csnerd.demo.utils.PageableUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.util.*;

@RequiredArgsConstructor
@Service
public class PostQueryService {
    private final PostRepository postRepository;
    private final PostCacheableService postCacheableService;
    private final FingerprintService fingerprintService;
    private final ETagFactory eTagFactory;
    private final PageableUtils pageableUtils;
    private final VoteService voteService;
    private final PublicResourceUriFactory publicResourceUriFactory;
    private final PostContentLoader postContentLoader;

    private Slice<Long> getActivePostIdsByCategorySlug(String categorySlug, Pageable pageable) {
        return postRepository.getActivePostIdsSliceByCategorySlug(categorySlug, pageable);
    }

    public ETagResponse<Slice<PublicPostBriefDTO>> getPostBriefSliceByCategorySlug(String categorySlug, Pageable pageable) {
        Slice<Long> ids = getActivePostIdsByCategorySlug(categorySlug, pageable);
        List<String> componentsForETag = pageableUtils.getRepresentationForSlice("public-post-brief-slice:v1", pageable, ids);
        if (ids.isEmpty()) {
            String eTag = eTagFactory.weakETag(componentsForETag.toArray(String[]::new));
            return ETagResponse.from(new SliceImpl<>(Collections.emptyList(), pageable, ids.hasNext()), eTag);
        }
        Map<Long, CachedContent<PublicPostBriefContentDTO>> postBriefContentDTOs = postCacheableService.getPostBriefContentByPostIds(ids.getContent());
        Map<Long, VoteStatsDTO> postVoteStatsMap = voteService.getPostVoteInformationByPostIds(ids.getContent());
        List<PublicPostBriefDTO> publicPostBriefDTOs = new ArrayList<>();
        for (Long id : ids.getContent()) {
            CachedContent<PublicPostBriefContentDTO> cachedContent = postBriefContentDTOs.get(id);
            VoteStatsDTO voteStatsInformation = postVoteStatsMap.get(id);
            if (cachedContent == null || voteStatsInformation == null) continue;
            String voteStatsFingerprint = fingerprintService.fingerprint(voteStatsInformation.getFingerprintData());
            publicPostBriefDTOs.add(PublicPostBriefDTO.from(cachedContent.content(), voteStatsInformation));
            // ETag computation
            componentsForETag.add("id:" + id);
            componentsForETag.add("content:" + cachedContent.fingerprint());
            componentsForETag.add("votes:" + voteStatsFingerprint);
        }
        String eTag = eTagFactory.weakETag(componentsForETag.toArray(String[]::new));
        return ETagResponse.from(new SliceImpl<>(publicPostBriefDTOs, pageable, ids.hasNext()), eTag);
    }

    public ETagResponse<PublicPostDetailDTO> findPublicPostByPublicUri(String publicUri, UserPrincipal userPrincipal) {
        Long postId = postRepository.getActivePostIdByPublicUri(publicUri).orElseThrow(() -> new PostByPublicUriNotFoundException(publicUri));
        CachedContent<PublicPostDetailContentDTO> cachedContent = postCacheableService.findPublicPostDetailContentById(postId);
        VoteStatsDTO voteStatsInformation = voteService.getPostVoteInformationByPublicUri(publicUri);
        String voteStatsFingerprint = fingerprintService.fingerprint(voteStatsInformation.getFingerprintData());
        Byte userVote = null;
        if (userPrincipal != null) {
            userVote = voteService.getVoteForPostByUserId(postId, userPrincipal.getUser().getId());
        }
        // ETag computation
        List<String> componentsForETag = new ArrayList<>();
        componentsForETag.add("public-post-detail:v1");
        componentsForETag.add("name:" + cachedContent.content().slugName());
        componentsForETag.add("content:" + cachedContent.fingerprint());
        componentsForETag.add("votes:" + voteStatsFingerprint);
        componentsForETag.add(userVote == null ? "viewer-vote:anonymous" : "viewer-vote" + userVote);
        String eTag = eTagFactory.weakETag(componentsForETag.toArray(String[]::new));
        return ETagResponse.from(PublicPostDetailDTO.from(cachedContent.content(), voteStatsInformation, userVote), eTag);
    }

    public ETagResponse<Page<AdminPostBriefDTO>> getPostsForAdmin(Pageable pageable) {
        Page<Long> ids = postRepository.getPostsPage(pageable);
        List<String> componentsForETag = pageableUtils.getRepresentationForPage("admin-post-brief-page:v1", pageable, ids);
        if (ids.isEmpty()) {
            String eTag = eTagFactory.weakETag(componentsForETag.toArray(String[]::new));
            return ETagResponse.from(new PageImpl<>(Collections.emptyList(), pageable, 0), eTag);
        }
        Map<Long, CachedContent<AdminPostBriefContentDTO>> postBriefContentDTOs = postCacheableService.getAdminPostBriefContentByPostIds(ids.getContent());
        Map<Long, VoteStatsDTO> postVoteStatsMap = voteService.getPostVoteInformationByPostIds(ids.getContent());
        List<AdminPostBriefDTO> adminPostBriefDTOs = new ArrayList<>();
        for (Long id : ids.getContent()) {
            CachedContent<AdminPostBriefContentDTO> cachedContent = postBriefContentDTOs.get(id);
            VoteStatsDTO voteStatsInformation = postVoteStatsMap.get(id);
            if (cachedContent == null || voteStatsInformation == null) continue;
            String voteStatsFingerprint = fingerprintService.fingerprint(voteStatsInformation.getFingerprintData());
            adminPostBriefDTOs.add(AdminPostBriefDTO.from(cachedContent.content(), voteStatsInformation));
            // ETag computation
            componentsForETag.add("id:" + id);
            componentsForETag.add("content:" + cachedContent.fingerprint());
            componentsForETag.add("votes:" + voteStatsFingerprint);
        }
        String eTag = eTagFactory.weakETag(componentsForETag.toArray(String[]::new));
        return ETagResponse.from(new PageImpl<>(adminPostBriefDTOs, pageable, ids.getTotalElements()), eTag);
    }

    public ETagResponse<AdminPostDetailDTO> findAdminPostById(Long id) {
        CachedContent<AdminPostDetailContentDTO> postDetailContentDTO = postCacheableService.findAdminPostDetailContentById(id);
        VoteStatsDTO voteStatsInformation = voteService.getPostVoteInformationByPostId(id);
        String voteStatsFingerprint = fingerprintService.fingerprint(voteStatsInformation.getFingerprintData());
        // ETag computation
        List<String> componentsForETag = new ArrayList<>();
        componentsForETag.add("admin-post-detail:v1");
        componentsForETag.add("id:" + id);
        componentsForETag.add("content:" + postDetailContentDTO.fingerprint());
        componentsForETag.add("votes:" + voteStatsFingerprint);
        String eTag = eTagFactory.weakETag(componentsForETag.toArray(String[]::new));
        return ETagResponse.from(AdminPostDetailDTO.from(postDetailContentDTO.content(), voteStatsInformation), eTag);
    }

    public ETagResponse<Slice<PersonalPostBriefDTO>> getPostBriefSliceForProfile(UserPrincipal userPrincipal, Pageable pageable) {
        requireAuthenticated(userPrincipal);
        Slice<Long> ids = postRepository.getPostIdsSliceForProfile(userPrincipal.getUser().getId(), pageable);
        List<String> componentsForETag = pageableUtils.getRepresentationForSlice("profile-post-brief-slice:v1", pageable, ids);
        componentsForETag.add("user:" + userPrincipal.getUser().getId());
        if (ids.isEmpty()) {
            String eTag = eTagFactory.weakETag(componentsForETag.toArray(String[]::new));
            return ETagResponse.from(new SliceImpl<>(Collections.emptyList(), pageable, ids.hasNext()), eTag);
        }
        Map<Long, CachedContent<PersonalPostBriefContentDTO>> postBriefContentDTOs = postContentLoader.loadProfilePostBriefContentByIds(Set.copyOf(ids.getContent()));
        Map<Long, VoteStatsDTO> postVoteStatsMap = voteService.getPostVoteInformationByPostIds(ids.getContent());
        List<PersonalPostBriefDTO> profilePostBriefDTOs = new ArrayList<>();
        for (Long id : ids.getContent()) {
            CachedContent<PersonalPostBriefContentDTO> cachedContent = postBriefContentDTOs.get(id);
            VoteStatsDTO voteStatsInformation = postVoteStatsMap.get(id);
            if (cachedContent == null || voteStatsInformation == null) continue;
            String voteStatsFingerprint = fingerprintService.fingerprint(voteStatsInformation.getFingerprintData());
            profilePostBriefDTOs.add(PersonalPostBriefDTO.from(cachedContent.content(), voteStatsInformation));
            // ETag computation
            componentsForETag.add("id:" + id);
            componentsForETag.add("content:" + cachedContent.fingerprint());
            componentsForETag.add("votes:" + voteStatsFingerprint);
        }
        String eTag = eTagFactory.weakETag(componentsForETag.toArray(String[]::new));
        return ETagResponse.from(new SliceImpl<>(profilePostBriefDTOs, pageable, ids.hasNext()), eTag);
    }

    public ETagResponse<PersonalPostDetailDTO> findPostByPublicUriForProfile(String publicUri, UserPrincipal userPrincipal) {
        requireAuthenticated(userPrincipal);
        Long id = postRepository.getPostIdForProfileByPublicUri(publicUri, userPrincipal.getUser().getId()).orElseThrow(() -> new PostByPublicUriNotFoundException(publicUri));
        CachedContent<PersonalPostDetailContentDTO> postDetailContentDTO = postContentLoader.loadProfilePostDetailContentById(id);
        VoteStatsDTO voteStatsInformation = voteService.getPostVoteInformationByPostId(id);
        String voteStatsFingerprint = fingerprintService.fingerprint(voteStatsInformation.getFingerprintData());
        // ETag computation
        List<String> componentsForETag = new ArrayList<>();
        componentsForETag.add("profile-post-detail:v1");
        componentsForETag.add("id:" + id);
        componentsForETag.add("content:" + postDetailContentDTO.fingerprint());
        componentsForETag.add("votes:" + voteStatsFingerprint);
        String eTag = eTagFactory.weakETag(componentsForETag.toArray(String[]::new));
        return ETagResponse.from(PersonalPostDetailDTO.from(postDetailContentDTO.content(), voteStatsInformation), eTag);
    }

    public List<Long> getPostIdsByCategoryId(Long categoryId) {
        return postRepository.getPostIdsByCategoryId(categoryId);
    }
    public boolean existsPostByCategoryId(Long categoryId) { return postRepository.existsPostByCategoryId(categoryId); }
    public List<Long> getPostIdsByTagId(Long tagId) {
        return postRepository.getPostIdsByTagId(tagId);
    }

    public boolean existsActiveByTagId(Long tagId) {
        return postRepository.existsActiveByTagId(tagId);
    }

    private void requireAuthenticated(UserPrincipal principal) {
        if (principal == null) throw new UnauthorizedException(HttpStatus.UNAUTHORIZED);
    }
}
