package com.tmb.csnerd.demo.dto.topic.publicresponse;

import com.tmb.csnerd.demo.domain.models.Topic;

public record TopicPublicRefDTO(
    String name,
    String slugName
) {
    public static TopicPublicRefDTO from(Topic topic) {
        return new TopicPublicRefDTO(topic.getName(), topic.getSlugName());
    }
    public static TopicPublicRefDTO from(String name, String slugName) {
        return new TopicPublicRefDTO(name, slugName);
    }

    public String getFingerprint() {
        return "topic:" + "slug=" + slugName;
    }
}
