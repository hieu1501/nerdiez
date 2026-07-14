package com.tmb.csnerd.demo.domain.services.topic;

import com.tmb.csnerd.demo.domain.models.Topic;
import com.tmb.csnerd.demo.domain.repositories.TopicRepository;
import com.tmb.csnerd.demo.dto.category.CategoryResponseDTO;
import com.tmb.csnerd.demo.dto.topic.TopicResponseDTO;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@AllArgsConstructor
@Service
public class TopicQueryService {
    private final TopicRepository topicRepository;

    public List<TopicResponseDTO> getAllTopics() {
        return topicRepository.findAll()
                .stream()
                .map(t -> new TopicResponseDTO(t.getId(), t.getName(), t.getSlugName(), t.getDescription(), t.getCategory().getId(), t.getCategory().getName()))
                .collect(Collectors.toList());
    }
}
