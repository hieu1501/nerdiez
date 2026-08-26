package com.tmb.csnerd.demo.domain.services.topic;

import com.tmb.csnerd.demo.domain.models.Topic;
import com.tmb.csnerd.demo.domain.repositories.post.projections.PostTopicsProjection;
import com.tmb.csnerd.demo.domain.repositories.topic.TopicRepository;
import com.tmb.csnerd.demo.domain.services.fingerprint.FingerprintDataList;
import com.tmb.csnerd.demo.domain.services.fingerprint.FingerprintService;
import com.tmb.csnerd.demo.dto.common.CachedContent;
import com.tmb.csnerd.demo.dto.topic.adminresponse.TopicAdminDetailDTO;
import com.tmb.csnerd.demo.dto.topic.publicresponse.TopicPublicDetailDTO;
import com.tmb.csnerd.demo.dto.topic.publicresponse.TopicPublicRefDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

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

    public Map<Long, List<TopicAdminDetailDTO>> loadAdminTopicsByCategoryIds(Set<Long> categoryIds) {
        List<Long> requestedCategories = List.copyOf(categoryIds);
        List<Topic> allTopics = topicRepository.getAllTopicsByCategoryIds(requestedCategories);
        return allTopics.stream()
                .collect(Collectors.groupingBy(t -> t.getCategory().getId(),
                        Collectors.mapping(TopicAdminDetailDTO::from, Collectors.toList())
                ));
    }

    public Map<Long, List<TopicPublicDetailDTO>> loadPublicTopicsByCategoryIds(Set<Long> categoryIds) {
        List<Long> requestedCategories = List.copyOf(categoryIds);
        List<Topic> allActiveTopics = topicRepository.getAllActiveTopicsByCategoryIds(requestedCategories);
        return allActiveTopics.stream()
                .collect(Collectors.groupingBy(t -> t.getCategory().getId(),
                        Collectors.mapping(TopicPublicDetailDTO::from, Collectors.toList())
                ));
    }
}
