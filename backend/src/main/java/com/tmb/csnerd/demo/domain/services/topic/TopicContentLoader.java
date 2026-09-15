package com.tmb.csnerd.demo.domain.services.topic;

import com.tmb.csnerd.demo.domain.models.Topic;
import com.tmb.csnerd.demo.domain.repositories.topic.TopicRepository;
import com.tmb.csnerd.demo.domain.repositories.topic.projections.TopicTagsProjection;
import com.tmb.csnerd.demo.domain.services.fingerprint.FingerprintService;
import com.tmb.csnerd.demo.domain.services.publicuri.PublicResourceUriFactory;
import com.tmb.csnerd.demo.dto.category.adminresponse.CategoryAdminRefDTO;
import com.tmb.csnerd.demo.dto.category.publicresponse.CategoryPublicRefDTO;
import com.tmb.csnerd.demo.dto.common.CachedContent;
import com.tmb.csnerd.demo.dto.tag.adminresponse.TagAdminRefDTO;
import com.tmb.csnerd.demo.dto.tag.publicresponse.TagPublicRefDTO;
import com.tmb.csnerd.demo.dto.topic.adminresponse.TopicAdminDetailDTO;
import com.tmb.csnerd.demo.dto.topic.publicresponse.TopicPersonalDetailDTO;
import com.tmb.csnerd.demo.dto.topic.publicresponse.TopicPublicDetailDTO;
import com.tmb.csnerd.demo.dto.user.UserRefDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Component
public class TopicContentLoader {
    private final TopicRepository topicRepository;
    private final FingerprintService fingerprintService;
    private final PublicResourceUriFactory publicResourceUriFactory;

    public Map<Long, CachedContent<TopicAdminDetailDTO>> loadAllTopicsForAdminByIds(Set<Long> ids) {
        List<Long> requestedIds = List.copyOf(ids);
        List<Topic> allTopics = topicRepository.getAllTopicsByIds(requestedIds);
        Map<Long, List<TagAdminRefDTO>> tagsMappedByTopicId = topicRepository.getTagsByTopicIdsSortedBySlugName(requestedIds).stream()
                .collect(Collectors.groupingBy(TopicTagsProjection::getTopicId,
                        Collectors.mapping(t -> TagAdminRefDTO.from(t.getTagId(), t.getTagSlug()), Collectors.toList())
                ));
        Map<Long, CachedContent<TopicAdminDetailDTO>> topicAdminDetailDTOs = new HashMap<>();
        for (Topic topic : allTopics) {
            CategoryAdminRefDTO category = CategoryAdminRefDTO.from(topic.getCategory());
            UserRefDTO author = UserRefDTO.from(topic.getAuthor());
            List<TagAdminRefDTO> tags = tagsMappedByTopicId.getOrDefault(topic.getId(), List.of());
            URI publicUri = publicResourceUriFactory.topic(topic.getPublicUri(), false);
            TopicAdminDetailDTO topicDetail = TopicAdminDetailDTO.from(topic.getId(), topic.getName(), topic.getSlug(), topic.getDescription(), author, category, tags, topic.getIsActive(), publicUri);
            String fingerprint = fingerprintService.fingerprint(topicDetail.getFingerprintData());
            topicAdminDetailDTOs.put(topic.getId(), new CachedContent<>(topicDetail, fingerprint));
        }
        return Map.copyOf(topicAdminDetailDTOs);
    }

    public Map<Long, CachedContent<TopicPublicDetailDTO>> loadAllTopicsForPublicByIds(Set<Long> ids) {
        List<Long> requestedIds = List.copyOf(ids);
        List<Topic> allTopics = topicRepository.getAllTopicsByIds(requestedIds);
        Map<Long, List<TagPublicRefDTO>> tagsMappedByTopicId = topicRepository.getTagsByTopicIdsSortedBySlugName(requestedIds).stream()
                .collect(Collectors.groupingBy(TopicTagsProjection::getTopicId,
                        Collectors.mapping(t -> TagPublicRefDTO.from(t.getTagSlug()), Collectors.toList())
                ));
        Map<Long, CachedContent<TopicPublicDetailDTO>> topicPublicDetailDTOs = new HashMap<>();
        for (Topic topic : allTopics) {
            CategoryPublicRefDTO category = CategoryPublicRefDTO.from(topic.getCategory());
            UserRefDTO author = UserRefDTO.from(topic.getAuthor());
            List<TagPublicRefDTO> tags = tagsMappedByTopicId.getOrDefault(topic.getId(), List.of());
            URI publicUri = publicResourceUriFactory.topic(topic.getPublicUri(), false);
            TopicPublicDetailDTO topicDetail = TopicPublicDetailDTO.from(topic.getName(), topic.getSlug(), topic.getDescription(), author, category, tags, publicUri);
            String fingerprint = fingerprintService.fingerprint(topicDetail.getFingerprintData());
            topicPublicDetailDTOs.put(topic.getId(), new CachedContent<>(topicDetail, fingerprint));
        }
        return Map.copyOf(topicPublicDetailDTOs);
    }

    public Map<Long, CachedContent<TopicPersonalDetailDTO>> loadAllTopicsForProfileByIds(Set<Long> ids) {
        List<Long> requestedIds = List.copyOf(ids);
        List<Topic> allTopics = topicRepository.getAllTopicsByIds(requestedIds);
        Map<Long, List<TagPublicRefDTO>> tagsMappedByTopicId = topicRepository.getTagsByTopicIdsSortedBySlugName(requestedIds).stream()
                .collect(Collectors.groupingBy(TopicTagsProjection::getTopicId,
                        Collectors.mapping(t -> TagPublicRefDTO.from(t.getTagSlug()), Collectors.toList())
                ));
        Map<Long, CachedContent<TopicPersonalDetailDTO>> topicPersonalDetailDTOs = new HashMap<>();
        for (Topic topic : allTopics) {
            CategoryPublicRefDTO category = CategoryPublicRefDTO.from(topic.getCategory());
            List<TagPublicRefDTO> tags = tagsMappedByTopicId.getOrDefault(topic.getId(), List.of());
            URI publicUri = publicResourceUriFactory.topic(topic.getPublicUri(), true);
            TopicPersonalDetailDTO topicDetail = TopicPersonalDetailDTO.from(topic.getName(), topic.getSlug(), topic.getDescription(), category, tags, topic.getIsActive(), publicUri);
            String fingerprint = fingerprintService.fingerprint(topicDetail.getFingerprintData());
            topicPersonalDetailDTOs.put(topic.getId(), new CachedContent<>(topicDetail, fingerprint));
        }
        return Map.copyOf(topicPersonalDetailDTOs);
    }
}
