package com.tmb.csnerd.demo.dto.topic;

import com.tmb.csnerd.demo.domain.models.Topic;
import com.tmb.csnerd.demo.dto.category.CategoryRefDTO;

public record TopicDetailDTO(
    Long topicId,
    String name,
    String slugName,
    String description,
    CategoryRefDTO category
) {
    public static TopicDetailDTO from(Topic topic) {
        return new TopicDetailDTO(topic.getId(), topic.getName(), topic.getSlugName(), topic.getDescription(), CategoryRefDTO.from(topic.getCategory()));
    }
}
