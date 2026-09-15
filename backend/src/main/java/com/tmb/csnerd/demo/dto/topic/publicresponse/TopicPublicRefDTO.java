package com.tmb.csnerd.demo.dto.topic.publicresponse;

import com.tmb.csnerd.demo.domain.models.Topic;
import com.tmb.csnerd.demo.dto.category.publicresponse.CategoryPublicRefDTO;

public record TopicPublicRefDTO(
    String name,
    String slugName,
    CategoryPublicRefDTO category
) {
    public static TopicPublicRefDTO from(Topic topic) {
        return new TopicPublicRefDTO(topic.getName(), topic.getSlug(), CategoryPublicRefDTO.from(topic.getCategory()));
    }

    public static TopicPublicRefDTO from(String name, String slugName, CategoryPublicRefDTO category) {
        return new TopicPublicRefDTO(name, slugName, category);
    }
}
