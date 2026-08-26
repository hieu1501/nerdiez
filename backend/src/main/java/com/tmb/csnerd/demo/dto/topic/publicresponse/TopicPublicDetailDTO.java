package com.tmb.csnerd.demo.dto.topic.publicresponse;

import com.tmb.csnerd.demo.domain.models.Topic;
import com.tmb.csnerd.demo.domain.services.fingerprint.IFingerprintData;
import com.tmb.csnerd.demo.dto.category.adminresponse.CategoryAdminRefDTO;
import com.tmb.csnerd.demo.dto.category.publicresponse.CategoryPublicDetailDTO;
import com.tmb.csnerd.demo.dto.category.publicresponse.CategoryPublicRefDTO;

public record TopicPublicDetailDTO(
    String name,
    String slugName,
    String description,
    CategoryPublicRefDTO category
) {
    private record FingerprintData(
            String representation,
            String name,
            String slugName,
            String description,
            CategoryPublicRefDTO category
    ) implements IFingerprintData {}

    public static TopicPublicDetailDTO from(Topic topic) {
        return new TopicPublicDetailDTO(topic.getName(), topic.getSlugName(), topic.getDescription(), CategoryPublicRefDTO.from(topic.getCategory()));
    }

    public IFingerprintData getFingerprintData() {
        return new FingerprintData("public-topic-detail", name, slugName, description, category);
    }
}
