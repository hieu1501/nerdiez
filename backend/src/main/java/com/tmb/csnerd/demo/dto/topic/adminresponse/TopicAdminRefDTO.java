package com.tmb.csnerd.demo.dto.topic.adminresponse;

import com.tmb.csnerd.demo.domain.models.Topic;

public record TopicAdminRefDTO(
    Long topicId,
    String name,
    String slugName
) {
    public static TopicAdminRefDTO from(Topic topic) {

        return new TopicAdminRefDTO(topic.getId(), topic.getName(), topic.getSlugName());
    }
    public static TopicAdminRefDTO from(Long id, String name, String slugName) {
        return new TopicAdminRefDTO(id, name, slugName);
    }

    public String getFingerprint() {
        return "topic:" + "id=" + topicId + ",slug=" + slugName;
    }
}
