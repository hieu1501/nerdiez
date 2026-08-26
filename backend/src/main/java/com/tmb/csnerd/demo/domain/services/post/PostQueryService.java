package com.tmb.csnerd.demo.domain.services.post;

import com.tmb.csnerd.demo.domain.repositories.post.projections.PostVotesInformationProjection;
import com.tmb.csnerd.demo.domain.security.UserPrincipal;
import com.tmb.csnerd.demo.domain.services.fingerprint.FingerprintService;
import com.tmb.csnerd.demo.domain.services.postvote.PostVoteService;
import com.tmb.csnerd.demo.dto.common.CachedContent;
import com.tmb.csnerd.demo.dto.common.ETagResponse;
import com.tmb.csnerd.demo.dto.post.PostVoteStatsDTO;
import com.tmb.csnerd.demo.dto.post.adminresponse.AdminPostBriefContentDTO;
import com.tmb.csnerd.demo.dto.post.adminresponse.AdminPostBriefDTO;
import com.tmb.csnerd.demo.dto.post.adminresponse.AdminPostDetailContentDTO;
import com.tmb.csnerd.demo.dto.post.adminresponse.AdminPostDetailDTO;
import com.tmb.csnerd.demo.dto.post.publicresponse.PublicPostBriefContentDTO;
import com.tmb.csnerd.demo.dto.post.publicresponse.PublicPostBriefDTO;
import com.tmb.csnerd.demo.dto.post.publicresponse.PublicPostDetailContentDTO;
import com.tmb.csnerd.demo.domain.repositories.post.PostRepository;
import com.tmb.csnerd.demo.dto.post.publicresponse.PublicPostDetailDTO;
import com.tmb.csnerd.demo.exceptions.post.PostByIdNotFoundException;
import com.tmb.csnerd.demo.exceptions.post.PostByNameNotFoundException;
import com.tmb.csnerd.demo.exceptions.post.PostByNameNotMatchCategoryException;
import com.tmb.csnerd.demo.utils.ETagFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
public class PostQueryService {
    private final PostRepository postRepository;
    private final PostCacheableService postCacheableService;
    private final FingerprintService fingerprintService;
    private final ETagFactory eTagFactory;
    private final PostVoteService postVoteService;

    public Slice<Long> getActivePostIdsByCategorySlug(String categorySlug, Pageable pageable) {
        return postRepository.getActivePostIdsSliceByCategorySlug(categorySlug, pageable);
    }

    public ETagResponse<Slice<PublicPostBriefDTO>> getPostBriefSliceByCategorySlug(String categorySlug, Pageable pageable) {
        Slice<Long> ids = getActivePostIdsByCategorySlug(categorySlug, pageable);
        List<String> componentsForETag = new ArrayList<>();
        componentsForETag.add("public-post-brief-slice:v1");
        componentsForETag.add("size:" + ids.getSize());
        componentsForETag.add("offset:" + ids.getPageable().getOffset());
        componentsForETag.add("has-next:" + ids.hasNext());
        componentsForETag.add("has-previous:" + ids.hasPrevious());
        componentsForETag.add("item-count:" + ids.getNumberOfElements());
        if (ids.isEmpty()) {
            String eTag = eTagFactory.weakETag(componentsForETag.toArray(String[]::new));
            return ETagResponse.from(new SliceImpl<>(Collections.emptyList(), pageable, ids.hasNext()), eTag);
        }
        Map<Long, CachedContent<PublicPostBriefContentDTO>> postBriefContentDTOs = postCacheableService.getPostBriefContentByPostIds(ids.getContent());
        Map<Long, PostVoteStatsDTO> postVoteStatsMap = postVoteService.getPostVoteInformationByPostIds(ids.getContent());
        List<PublicPostBriefDTO> publicPostBriefDTOs = new ArrayList<>();
        for (Long id : ids.getContent()) {
            CachedContent<PublicPostBriefContentDTO> cachedContent = postBriefContentDTOs.get(id);
            PostVoteStatsDTO voteStatsInformation = postVoteStatsMap.get(id);
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

    public ETagResponse<PublicPostDetailDTO> findPublicPostByCategorySlugAndSlugName(String slugCategoryName, String slugPostName, UserPrincipal userPrincipal) {
        Long postId = postRepository.getActivePostIdByCategoryAndSlugName(slugCategoryName, slugPostName).orElseThrow(() -> new PostByNameNotFoundException(slugPostName));
        CachedContent<PublicPostDetailContentDTO> cachedContent = postCacheableService.findPublicPostDetailContentById(postId);
        PostVoteStatsDTO voteStatsInformation = postVoteService.getPostVoteInformationByCategorySlugAndSlugName(slugCategoryName, slugPostName);
        String voteStatsFingerprint = fingerprintService.fingerprint(voteStatsInformation.getFingerprintData());
        Byte userVote = null;
        if (userPrincipal != null) {
            userVote = postVoteService.getVoteForPostIdByUserId(postId, userPrincipal.getUser().getId());
        }
        // ETag computation
        List<String> componentsForETag = new ArrayList<>();
        componentsForETag.add("public-post-detail:v1");
        componentsForETag.add("name:" + slugPostName);
        componentsForETag.add("content:" + cachedContent.fingerprint());
        componentsForETag.add("votes:" + voteStatsFingerprint);
        componentsForETag.add(userVote == null ? "viewer-vote:anonymous" : "viewer-vote" + userVote);
        String eTag = eTagFactory.weakETag(componentsForETag.toArray(String[]::new));
        return ETagResponse.from(PublicPostDetailDTO.from(cachedContent.content(), voteStatsInformation, userVote), eTag);
    }

    public ETagResponse<Page<AdminPostBriefDTO>> getPostsForAdmin(Pageable pageable) {
        Page<Long> ids = postRepository.getPostsPage(pageable);
        List<String> componentsForETag = new ArrayList<>();
        componentsForETag.add("admin-post-brief-page:v1");
        componentsForETag.add("size:" + ids.getSize());
        componentsForETag.add("offset:" + ids.getPageable().getOffset());
        componentsForETag.add("has-next:" + ids.hasNext());
        componentsForETag.add("has-previous:" + ids.hasPrevious());
        componentsForETag.add("total-page-count:" + ids.getTotalPages());
        componentsForETag.add("total-item-count:" + ids.getTotalElements());
        componentsForETag.add("item-count:" + ids.getNumberOfElements());
        if (ids.isEmpty()) {
            String eTag = eTagFactory.weakETag(componentsForETag.toArray(String[]::new));
            return ETagResponse.from(new PageImpl<>(Collections.emptyList(), pageable, 0), eTag);
        }
        Map<Long, CachedContent<AdminPostBriefContentDTO>> postBriefContentDTOs = postCacheableService.getAdminPostBriefContentByPostIds(ids.getContent());
        Map<Long, PostVoteStatsDTO> postVoteStatsMap = postVoteService.getPostVoteInformationByPostIds(ids.getContent());
        List<AdminPostBriefDTO> adminPostBriefDTOs = new ArrayList<>();
        for (Long id : ids.getContent()) {
            CachedContent<AdminPostBriefContentDTO> cachedContent = postBriefContentDTOs.get(id);
            PostVoteStatsDTO voteStatsInformation = postVoteStatsMap.get(id);
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
        PostVoteStatsDTO voteStatsInformation = postVoteService.getPostVoteInformationByPostIds(List.of(id)).getOrDefault(id, null);
        if (voteStatsInformation == null) {
            throw new PostByIdNotFoundException(id);
        }
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

    public List<Long> getPostIdsByCategoryId(Long categoryId) {
        return postRepository.getPostIdsByCategoryId(categoryId);
    }
    public boolean existsActiveByCategoryId(Long categoryId) { return postRepository.existsActiveByCategoryId(categoryId); }
    public List<Long> getPostIdsByTopicId(Long topicId) {
        return postRepository.getPostIdsByTopicId(topicId);
    }

    public boolean existsActiveByTopicId(Long topicId) {
        return postRepository.existsActiveByTopicId(topicId);
    }

    public Long getPostIdByCategorySlugAndPostSlug(String categorySlug, String postSlugName) {
        return postRepository.getPostIdByCategorySlugAndPostSlug(categorySlug, postSlugName).orElseThrow(() -> new PostByNameNotMatchCategoryException(postSlugName, categorySlug));
    }
}
