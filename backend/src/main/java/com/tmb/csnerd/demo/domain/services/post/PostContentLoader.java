package com.tmb.csnerd.demo.domain.services.post;

import com.tmb.csnerd.demo.domain.repositories.post.PostRepository;
import com.tmb.csnerd.demo.domain.repositories.post.projections.*;
import com.tmb.csnerd.demo.domain.services.fingerprint.FingerprintService;
import com.tmb.csnerd.demo.domain.services.publicuri.PublicResourceUriFactory;
import com.tmb.csnerd.demo.dto.category.adminresponse.CategoryAdminRefDTO;
import com.tmb.csnerd.demo.dto.category.publicresponse.CategoryPublicRefDTO;
import com.tmb.csnerd.demo.dto.common.CachedContent;
import com.tmb.csnerd.demo.dto.post.adminresponse.AdminPostBriefContentDTO;
import com.tmb.csnerd.demo.dto.post.adminresponse.AdminPostDetailContentDTO;
import com.tmb.csnerd.demo.dto.post.publicresponse.PersonalPostBriefContentDTO;
import com.tmb.csnerd.demo.dto.post.publicresponse.PersonalPostDetailContentDTO;
import com.tmb.csnerd.demo.dto.post.publicresponse.PublicPostBriefContentDTO;
import com.tmb.csnerd.demo.dto.post.publicresponse.PublicPostDetailContentDTO;
import com.tmb.csnerd.demo.dto.tag.adminresponse.TagAdminRefDTO;
import com.tmb.csnerd.demo.dto.tag.publicresponse.TagPublicRefDTO;
import com.tmb.csnerd.demo.dto.user.UserRefDTO;
import com.tmb.csnerd.demo.exceptions.post.PostByIdNotFoundException;
import com.tmb.csnerd.demo.utils.MarkdownUtils;
import com.tmb.csnerd.demo.domain.services.media.MediaUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class PostContentLoader {
    private final PostRepository postRepository;
    private final MediaUtils mediaUtils;
    private final MarkdownUtils markdownUtils;
    private final FingerprintService fingerprintService;
    private final PublicResourceUriFactory publicResourceUriFactory;

    public Map<Long, CachedContent<AdminPostBriefContentDTO>> loadAdminPostBriefContentByIds(Set<Long> ids) {
        List<Long> requestedIds = List.copyOf(ids);
        List<AdminPostBriefContentProjection> postInformationList = postRepository.getPostInformationForAdminByIds(requestedIds);
        Map<Long, List<TagAdminRefDTO>> tagsMappedByPostId = postRepository.getTagsByPostIdsSortedBySlugName(requestedIds).stream()
                .collect(Collectors.groupingBy(PostTagsProjection::getPostId,
                        Collectors.mapping(t -> TagAdminRefDTO.from(t.getTagId(), t.getTagSlug()), Collectors.toList())
                ));
        Map<Long, CachedContent<AdminPostBriefContentDTO>> postBriefContentDTOs = new HashMap<>();
        for (AdminPostBriefContentProjection postInformation : postInformationList) {
            UserRefDTO author = UserRefDTO.from(postInformation.getAuthorName());
            CategoryAdminRefDTO category = CategoryAdminRefDTO.from(postInformation.getCategoryId(), postInformation.getCategoryName(), postInformation.getCategorySlug());
            List<TagAdminRefDTO> tags = tagsMappedByPostId.getOrDefault(postInformation.getId(), List.of());
            URI canonicalUri = publicResourceUriFactory.post(postInformation.getPublicUri(), false);
            AdminPostBriefContentDTO content = AdminPostBriefContentDTO.from(postInformation.getId(), postInformation.getSlug(), postInformation.getTitle(), author, category, tags, postInformation.getCreatedAt(), postInformation.getUpdatedAt(), postInformation.getIsActive(), canonicalUri);
            String fingerprint = fingerprintService.fingerprint(content.getFingerprintData());
            postBriefContentDTOs.put(postInformation.getId(), new CachedContent<>(content, fingerprint));
        }
        return Map.copyOf(postBriefContentDTOs);
    }

    public Map<Long, CachedContent<PublicPostBriefContentDTO>> loadPublicPostBriefContentByIds(Set<Long> ids) {
        List<Long> requestedIds = List.copyOf(ids);
        List<PublicPostBriefContentProjection> postInformationList = postRepository.getPostInformationByIds(requestedIds);
        Map<Long, List<TagPublicRefDTO>> tagsMappedByPostId = postRepository.getTagsByPostIdsSortedBySlugName(requestedIds).stream()
                .collect(Collectors.groupingBy(PostTagsProjection::getPostId,
                        Collectors.mapping(t -> TagPublicRefDTO.from(t.getTagSlug()), Collectors.toList())
                ));
        Map<Long, CachedContent<PublicPostBriefContentDTO>> postBriefContentDTOs = new HashMap<>();
        for (PublicPostBriefContentProjection postInformation : postInformationList) {
            UserRefDTO author = UserRefDTO.from(postInformation.getAuthorName());
            CategoryPublicRefDTO category = CategoryPublicRefDTO.from(postInformation.getCategoryName(), postInformation.getCategorySlug());
            List<TagPublicRefDTO> tags = tagsMappedByPostId.getOrDefault(postInformation.getId(), List.of());
            URI canonicalUri = publicResourceUriFactory.post(postInformation.getPublicUri(), false);
            String denormalizedFeaturedImageUrl = mediaUtils.buildMediaUrl(postInformation.getFeaturedImage());
            PublicPostBriefContentDTO content = PublicPostBriefContentDTO.from(postInformation.getSlug(), postInformation.getTitle(), author, category, tags, postInformation.getCreatedAt(), postInformation.getUpdatedAt(), denormalizedFeaturedImageUrl, canonicalUri);
            String fingerprint = fingerprintService.fingerprint(content.getFingerprintData());
            postBriefContentDTOs.put(postInformation.getId(), new CachedContent<>(content, fingerprint));
        }
        return Map.copyOf(postBriefContentDTOs);
    }

    public Map<Long, CachedContent<PersonalPostBriefContentDTO>> loadProfilePostBriefContentByIds(Set<Long> ids) {
        List<Long> requestedIds = List.copyOf(ids);
        List<PersonalPostBriefContentProjection> postInformationList = postRepository.getPostInformationForProfileByIds(requestedIds);
        Map<Long, List<TagPublicRefDTO>> tagsMappedByPostId = postRepository.getTagsByPostIdsSortedBySlugName(requestedIds).stream()
                .collect(Collectors.groupingBy(PostTagsProjection::getPostId,
                        Collectors.mapping(t -> TagPublicRefDTO.from(t.getTagSlug()), Collectors.toList())
                ));
        Map<Long, CachedContent<PersonalPostBriefContentDTO>> postBriefContentDTOs = new HashMap<>();
        for (PersonalPostBriefContentProjection postInformation : postInformationList) {
            CategoryPublicRefDTO category = CategoryPublicRefDTO.from(postInformation.getCategoryName(), postInformation.getCategorySlug());
            List<TagPublicRefDTO> tags = tagsMappedByPostId.getOrDefault(postInformation.getId(), List.of());
            URI canonicalUri = publicResourceUriFactory.post(postInformation.getPublicUri(), true);
            String denormalizedFeaturedImageUrl = mediaUtils.buildMediaUrl(postInformation.getFeaturedImage());
            PersonalPostBriefContentDTO content = PersonalPostBriefContentDTO.from(postInformation.getSlug(), postInformation.getTitle(), category, tags, postInformation.getCreatedAt(), postInformation.getUpdatedAt(), denormalizedFeaturedImageUrl, postInformation.getIsActive(), canonicalUri);
            String fingerprint = fingerprintService.fingerprint(content.getFingerprintData());
            postBriefContentDTOs.put(postInformation.getId(), new CachedContent<>(content, fingerprint));
        }
        return Map.copyOf(postBriefContentDTOs);
    }

    public CachedContent<AdminPostDetailContentDTO> loadAdminPostDetailContentById(Long id) {
        AdminPostDetailContentProjection postInformation = postRepository.getPostContentByPostId(id).orElseThrow(() -> new PostByIdNotFoundException(id));
        UserRefDTO author = UserRefDTO.from(postInformation.getAuthorName());
        List<TagAdminRefDTO> tags = postRepository.getTagsByPostIdsSortedBySlugName(List.of(id)).stream()
                .filter(t -> id.equals(t.getPostId())).map(t -> TagAdminRefDTO.from(t.getTagId(), t.getTagSlug())).toList();
        CategoryAdminRefDTO categoryRef = CategoryAdminRefDTO.from(postInformation.getCategoryId(), postInformation.getCategoryName(), postInformation.getCategorySlug());
        String denormalizedContent = markdownUtils.denormalizeImageUrlsInContent(postInformation.getContent());
        String denormalizedFeaturedImageUrl = mediaUtils.buildMediaUrl(postInformation.getFeaturedImage());
        URI canonicalUri = publicResourceUriFactory.post(postInformation.getPublicUri(), false);
        AdminPostDetailContentDTO detailContent = AdminPostDetailContentDTO.from(id, postInformation.getSlug(), postInformation.getTitle(), denormalizedContent, author, categoryRef, postInformation.getCreatedAt(), postInformation.getUpdatedAt(), tags, denormalizedFeaturedImageUrl, postInformation.getDescription(), postInformation.getIsActive(), canonicalUri);
        String fingerprint = fingerprintService.fingerprint(detailContent.getFingerprintData());
        return new CachedContent<>(detailContent, fingerprint);
    }

    public CachedContent<PublicPostDetailContentDTO> loadPublicPostDetailContentById(Long id) {
        PublicPostDetailContentProjection postInformation = postRepository.getActivePostContentById(id).orElseThrow(() -> new PostByIdNotFoundException(id));
        UserRefDTO author = UserRefDTO.from(postInformation.getAuthorName());
        List<TagPublicRefDTO> tags = postRepository.getTagsByPostIdsSortedBySlugName(List.of(postInformation.getId())).stream()
                .filter(t -> postInformation.getId().equals(t.getPostId())).map(t -> TagPublicRefDTO.from(t.getTagSlug())).toList();
        CategoryPublicRefDTO categoryRef = CategoryPublicRefDTO.from(postInformation.getCategoryName(), postInformation.getCategorySlug());
        String denormalizedContent = markdownUtils.denormalizeImageUrlsInContent(postInformation.getContent());
        String denormalizedFeaturedImageUrl = mediaUtils.buildMediaUrl(postInformation.getFeaturedImage());
        URI canonicalUri = publicResourceUriFactory.post(postInformation.getPublicUri(), false);
        PublicPostDetailContentDTO postDetailContent = PublicPostDetailContentDTO.from(postInformation.getSlug(), postInformation.getTitle(), denormalizedContent, author, categoryRef, postInformation.getCreatedAt(), postInformation.getUpdatedAt(), tags, denormalizedFeaturedImageUrl, postInformation.getDescription(), canonicalUri);
        String fingerprint = fingerprintService.fingerprint(postDetailContent.getFingerprintData());
        return new CachedContent<>(postDetailContent, fingerprint);
    }

    public CachedContent<PersonalPostDetailContentDTO> loadProfilePostDetailContentById(Long id) {
        PersonalPostDetailContentProjection postInformation = postRepository.getPersonalContentByPostId(id).orElseThrow(() -> new PostByIdNotFoundException(id));
        List<TagPublicRefDTO> tags = postRepository.getTagsByPostIdsSortedBySlugName(List.of(postInformation.getId())).stream()
                .filter(t -> postInformation.getId().equals(t.getPostId())).map(t -> TagPublicRefDTO.from(t.getTagSlug())).toList();
        CategoryPublicRefDTO categoryRef = CategoryPublicRefDTO.from(postInformation.getCategoryName(), postInformation.getCategorySlug());
        String denormalizedContent = markdownUtils.denormalizeImageUrlsInContent(postInformation.getContent());
        String denormalizedFeaturedImageUrl = mediaUtils.buildMediaUrl(postInformation.getFeaturedImage());
        URI canonicalUri = publicResourceUriFactory.post(postInformation.getPublicUri(), true);
        PersonalPostDetailContentDTO detailContent = PersonalPostDetailContentDTO.from(postInformation.getSlug(), postInformation.getTitle(), denormalizedContent, categoryRef, postInformation.getCreatedAt(), postInformation.getUpdatedAt(), tags, denormalizedFeaturedImageUrl, postInformation.getDescription(), postInformation.getIsActive(), canonicalUri);
        String fingerprint = fingerprintService.fingerprint(detailContent.getFingerprintData());
        return new CachedContent<>(detailContent, fingerprint);
    }
}
