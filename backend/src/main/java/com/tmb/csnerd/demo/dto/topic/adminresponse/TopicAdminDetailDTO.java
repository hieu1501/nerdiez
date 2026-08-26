package com.tmb.csnerd.demo.dto.topic.adminresponse;

import com.tmb.csnerd.demo.domain.models.Topic;
import com.tmb.csnerd.demo.domain.services.fingerprint.IFingerprintData;
import com.tmb.csnerd.demo.dto.category.adminresponse.CategoryAdminRefDTO;
import com.tmb.csnerd.demo.dto.category.publicresponse.CategoryPublicRefDTO;
import com.tmb.csnerd.demo.dto.topic.publicresponse.TopicPublicDetailDTO;

public record TopicAdminDetailDTO(
    Long topicId,
    String name,
    String slugName,
    String description,
    Boolean isActive,
    CategoryAdminRefDTO category
) {
    private record FingerprintData(
            String representation,
            Long topicId,
            String name,
            String slugName,
            String description,
            Boolean isActive,
            CategoryAdminRefDTO category
    ) implements IFingerprintData {}

    public static TopicAdminDetailDTO from(Topic topic) {
        return new TopicAdminDetailDTO(topic.getId(), topic.getName(), topic.getSlugName(), topic.getDescription(), topic.getIsActive(), CategoryAdminRefDTO.from(topic.getCategory()));
    }

    public IFingerprintData getFingerprintData() {
        return new FingerprintData("admin-topic-detail", topicId, name, slugName, description, isActive, category);
    }
}
