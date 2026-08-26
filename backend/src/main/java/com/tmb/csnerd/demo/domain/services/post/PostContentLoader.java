package com.tmb.csnerd.demo.domain.services.post;

import com.tmb.csnerd.demo.domain.repositories.post.PostRepository;
import com.tmb.csnerd.demo.domain.repositories.post.projections.*;
import com.tmb.csnerd.demo.domain.services.fingerprint.FingerprintService;
import com.tmb.csnerd.demo.dto.category.adminresponse.CategoryAdminRefDTO;
import com.tmb.csnerd.demo.dto.category.publicresponse.CategoryPublicRefDTO;
import com.tmb.csnerd.demo.dto.common.CachedContent;
import com.tmb.csnerd.demo.dto.post.adminresponse.AdminPostBriefContentDTO;
import com.tmb.csnerd.demo.dto.post.adminresponse.AdminPostDetailContentDTO;
import com.tmb.csnerd.demo.dto.post.publicresponse.PublicPostBriefContentDTO;
import com.tmb.csnerd.demo.dto.post.publicresponse.PublicPostDetailContentDTO;
import com.tmb.csnerd.demo.dto.topic.adminresponse.TopicAdminRefDTO;
import com.tmb.csnerd.demo.dto.topic.publicresponse.TopicPublicRefDTO;
import com.tmb.csnerd.demo.dto.user.UserRefDTO;
import com.tmb.csnerd.demo.exceptions.post.PostByIdNotFoundException;
import com.tmb.csnerd.demo.utils.MarkdownUtils;
import com.tmb.csnerd.demo.utils.MediaUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

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

    public Map<Long, CachedContent<AdminPostBriefContentDTO>> loadAdminPostBriefContentByIds(Set<Long> ids) {
        List<Long> requestedIds = List.copyOf(ids);
        List<AdminPostBriefContentProjection> postInformationList = postRepository.getPostInformationForAdminByIds(requestedIds);
        Map<Long, List<TopicAdminRefDTO>> topicsMappedByPostId = postRepository.getTopicsByPostIdsSortedBySlugName(requestedIds).stream()
                .collect(Collectors.groupingBy(PostTopicsProjection::getPostId,
                        Collectors.mapping(t -> TopicAdminRefDTO.from(t.getTopicId(), t.getTopicName(), t.getTopicSlug()), Collectors.toList())
                ));
        Map<Long, CachedContent<AdminPostBriefContentDTO>> postBriefContentDTOs = new HashMap<>();
        for (AdminPostBriefContentProjection postInformation : postInformationList) {
            UserRefDTO author = UserRefDTO.from(postInformation.getAuthorName());
            CategoryAdminRefDTO category = CategoryAdminRefDTO.from(postInformation.getCategoryId(), postInformation.getCategoryName(), postInformation.getCategorySlug());
            List<TopicAdminRefDTO> topics = topicsMappedByPostId.getOrDefault(postInformation.getId(), List.of());
            AdminPostBriefContentDTO content = AdminPostBriefContentDTO.from(postInformation.getId(), postInformation.getSlug(), postInformation.getTitle(), author, category, topics, postInformation.getCreatedAt(), postInformation.getUpdatedAt(), postInformation.getIsActive());
            String fingerprint = fingerprintService.fingerprint(content.getFingerprintData());
            postBriefContentDTOs.put(postInformation.getId(), new CachedContent<>(content, fingerprint));
        }
        return Map.copyOf(postBriefContentDTOs);
    }

    public Map<Long, CachedContent<PublicPostBriefContentDTO>> loadPublicPostBriefContentByIds(Set<Long> ids) {
        List<Long> requestedIds = List.copyOf(ids);
        List<PublicPostBriefContentProjection> postInformationList = postRepository.getPostInformationByIds(requestedIds);
        Map<Long, List<TopicPublicRefDTO>> topicsMappedByPostId = postRepository.getTopicsByPostIdsSortedBySlugName(requestedIds).stream()
                .collect(Collectors.groupingBy(PostTopicsProjection::getPostId,
                        Collectors.mapping(t -> TopicPublicRefDTO.from(t.getTopicName(), t.getTopicSlug()), Collectors.toList())
                ));
        Map<Long, CachedContent<PublicPostBriefContentDTO>> postBriefContentDTOs = new HashMap<>();
        for (PublicPostBriefContentProjection postInformation : postInformationList) {
            UserRefDTO author = UserRefDTO.from(postInformation.getAuthorName());
            CategoryPublicRefDTO category = CategoryPublicRefDTO.from(postInformation.getCategoryName(), postInformation.getCategorySlug());
            List<TopicPublicRefDTO> topics = topicsMappedByPostId.getOrDefault(postInformation.getId(), List.of());
            PublicPostBriefContentDTO content = PublicPostBriefContentDTO.from(postInformation.getSlug(), postInformation.getTitle(), author, category, topics, postInformation.getCreatedAt(), postInformation.getUpdatedAt());
            String fingerprint = fingerprintService.fingerprint(content.getFingerprintData());
            postBriefContentDTOs.put(postInformation.getId(), new CachedContent<>(content, fingerprint));
        }
        return Map.copyOf(postBriefContentDTOs);
    }

    public CachedContent<AdminPostDetailContentDTO> loadAdminPostDetailContentById(Long id) {
        AdminPostDetailContentProjection postInformation = postRepository.getPostContentByPostId(id).orElseThrow(() -> new PostByIdNotFoundException(id));
        UserRefDTO author = UserRefDTO.from(postInformation.getAuthorName());
        List<TopicAdminRefDTO> topics = postRepository.getTopicsByPostIdsSortedBySlugName(List.of(id)).stream()
                .filter(t -> id.equals(t.getPostId())).map(t -> TopicAdminRefDTO.from(t.getTopicId(), t.getTopicName(), t.getTopicSlug())).toList();
        CategoryAdminRefDTO categoryRef = CategoryAdminRefDTO.from(postInformation.getCategoryId(), postInformation.getCategoryName(), postInformation.getCategorySlug());
        String denormalizedContent = markdownUtils.denormalizeImageUrlsInContent(postInformation.getContent());
        String denormalizedFeaturedImageUrl = mediaUtils.buildMediaUrl(postInformation.getFeaturedImage());
        AdminPostDetailContentDTO detailContent = AdminPostDetailContentDTO.from(id, postInformation.getSlug(), postInformation.getTitle(), denormalizedContent, author, categoryRef, postInformation.getCreatedAt(), postInformation.getUpdatedAt(), topics, denormalizedFeaturedImageUrl, postInformation.getDescription(), postInformation.getIsActive());
        String fingerprint = fingerprintService.fingerprint(detailContent.getFingerprintData());
        return new CachedContent<>(detailContent, fingerprint);
    }

    public CachedContent<PublicPostDetailContentDTO> loadPublicPostDetailContentById(Long id) {
        PublicPostDetailContentProjection postInformation = postRepository.getActivePostContentById(id).orElseThrow(() -> new PostByIdNotFoundException(id));
        UserRefDTO author = UserRefDTO.from(postInformation.getAuthorName());
        List<TopicPublicRefDTO> topics = postRepository.getTopicsByPostIdsSortedBySlugName(List.of(postInformation.getId())).stream()
                .filter(t -> postInformation.getId().equals(t.getPostId())).map(t -> TopicPublicRefDTO.from(t.getTopicName(), t.getTopicSlug())).toList();
        CategoryPublicRefDTO categoryRef = CategoryPublicRefDTO.from(postInformation.getCategoryName(), postInformation.getCategorySlug());
        String denormalizedContent = markdownUtils.denormalizeImageUrlsInContent(postInformation.getContent());
        String denormalizedFeaturedImageUrl = mediaUtils.buildMediaUrl(postInformation.getFeaturedImage());
        PublicPostDetailContentDTO postDetailContent = PublicPostDetailContentDTO.from(postInformation.getSlug(), postInformation.getTitle(), denormalizedContent, author, categoryRef, postInformation.getCreatedAt(), postInformation.getUpdatedAt(), topics, denormalizedFeaturedImageUrl, postInformation.getDescription());
        String fingerprint = fingerprintService.fingerprint(postDetailContent.getFingerprintData());
        return new CachedContent<>(postDetailContent, fingerprint);
    }
}
