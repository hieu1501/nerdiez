package com.tmb.csnerd.demo.dto.topic.adminresponse;

import com.tmb.csnerd.demo.domain.models.Topic;
import com.tmb.csnerd.demo.domain.services.fingerprint.IFingerprintData;
import com.tmb.csnerd.demo.dto.category.adminresponse.CategoryAdminRefDTO;
import com.tmb.csnerd.demo.dto.tag.adminresponse.TagAdminRefDTO;
import com.tmb.csnerd.demo.dto.user.UserRefDTO;

import java.net.URI;
import java.util.Comparator;
import java.util.List;

public record TopicAdminDetailDTO(
    Long topicId,
    String name,
    String slugName,
    String description,
    UserRefDTO author,
    CategoryAdminRefDTO category,
    List<TagAdminRefDTO> tags,
    Boolean isActive,
    URI canonicalUri
) {
    private record FingerprintData(
            String representation,
            Long topicId,
            String name,
            String slugName,
            String description,
            UserRefDTO author,
            CategoryAdminRefDTO category,
            List<TagAdminRefDTO> tags,
            Boolean isActive
    ) implements IFingerprintData {}

    public static TopicAdminDetailDTO from(Topic topic, URI canonicalUri) {
        return new TopicAdminDetailDTO(
                topic.getId(),
                topic.getName(),
                topic.getSlug(),
                topic.getDescription(),
                UserRefDTO.from(topic.getAuthor()),
                CategoryAdminRefDTO.from(topic.getCategory()),
                topic.getTags().stream().map(TagAdminRefDTO::from).sorted(Comparator.comparing(TagAdminRefDTO::slugName)).toList(),
                topic.getIsActive(),
                canonicalUri);
    }

    public static TopicAdminDetailDTO from(Long id, String name, String slugName, String description, UserRefDTO author, CategoryAdminRefDTO category, List<TagAdminRefDTO> tags, Boolean isActive, URI canonicalUri) {
        return new TopicAdminDetailDTO(
                id,
                name,
                slugName,
                description,
                author,
                category,
                tags,
                isActive,
                canonicalUri);
    }

    public IFingerprintData getFingerprintData() {
        return new FingerprintData("admin-topic-detail", topicId, name, slugName, description, author, category, tags, isActive);
    }
}
