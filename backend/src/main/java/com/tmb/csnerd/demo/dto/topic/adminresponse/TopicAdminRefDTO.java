package com.tmb.csnerd.demo.dto.topic.adminresponse;

import com.tmb.csnerd.demo.domain.models.Topic;
import com.tmb.csnerd.demo.dto.category.adminresponse.CategoryAdminRefDTO;

public record TopicAdminRefDTO(
    Long topicId,
    String name,
    String slugName,
    CategoryAdminRefDTO category
) {
    public static TopicAdminRefDTO from(Topic topic) {
        return new TopicAdminRefDTO(topic.getId(), topic.getName(), topic.getSlug(), CategoryAdminRefDTO.from(topic.getCategory()));
    }

    public static TopicAdminRefDTO from(Long id, String name, String slugName, CategoryAdminRefDTO category) {
        return new TopicAdminRefDTO(id, name, slugName, category);
    }
}
