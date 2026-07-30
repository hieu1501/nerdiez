package com.tmb.csnerd.demo.domain.services.topic;

import com.tmb.csnerd.demo.domain.models.Topic;
import com.tmb.csnerd.demo.domain.repositories.TopicRepository;
import com.tmb.csnerd.demo.dto.category.CategoryRefDTO;
import com.tmb.csnerd.demo.dto.topic.TopicDetailDTO;
import lombok.AllArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@AllArgsConstructor
@Service
public class TopicQueryService {
    private final TopicRepository topicRepository;

    @Cacheable(value = "topics", key = "'all'")
    public List<TopicDetailDTO> getAllTopics() {
        return topicRepository.findAll()
                .stream()
                .map(t -> new TopicDetailDTO(t.getId(), t.getName(), t.getSlugName(), t.getDescription(), new CategoryRefDTO(t.getCategory().getId(), t.getCategory().getName())))
                .collect(Collectors.toList());
    }

    public List<Topic> findTopicsByIds(Set<Long> ids) {
        return topicRepository.findAllById(ids);
    }
}
