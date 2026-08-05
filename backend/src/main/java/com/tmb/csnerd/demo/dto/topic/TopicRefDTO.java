package com.tmb.csnerd.demo.dto.topic;

import com.tmb.csnerd.demo.domain.models.Topic;
import com.tmb.csnerd.demo.dto.category.CategoryRefDTO;

public record TopicRefDTO(
    Long topicId,
    String name
) {
    public static TopicRefDTO from(Topic topic) {
        return new TopicRefDTO(topic.getId(), topic.getName());
    }
}
