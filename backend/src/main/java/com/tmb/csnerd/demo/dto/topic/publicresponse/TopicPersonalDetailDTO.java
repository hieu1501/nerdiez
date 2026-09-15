package com.tmb.csnerd.demo.dto.topic.publicresponse;

import com.tmb.csnerd.demo.domain.models.Topic;
import com.tmb.csnerd.demo.domain.services.fingerprint.IFingerprintData;
import com.tmb.csnerd.demo.dto.category.publicresponse.CategoryPublicRefDTO;
import com.tmb.csnerd.demo.dto.tag.publicresponse.TagPublicRefDTO;
import com.tmb.csnerd.demo.dto.user.UserRefDTO;

import java.net.URI;
import java.util.Comparator;
import java.util.List;

public record TopicPersonalDetailDTO(
    String name,
    String slugName,
    String description,
    CategoryPublicRefDTO category,
    List<TagPublicRefDTO> tags,
    Boolean isActive,
    URI canonicalUri
) {
    private record FingerprintData(
            String representation,
            String name,
            String slugName,
            String description,
            CategoryPublicRefDTO category,
            List<TagPublicRefDTO> tags,
            Boolean isActive,
            String canonicalUri
            ) implements IFingerprintData {}

    public static TopicPersonalDetailDTO from(Topic topic, URI canonicalUri) {
        return new TopicPersonalDetailDTO(
                topic.getName(),
                topic.getSlug(),
                topic.getDescription(),
                CategoryPublicRefDTO.from(topic.getCategory()),
                topic.getTags().stream().map(TagPublicRefDTO::from).sorted(Comparator.comparing(TagPublicRefDTO::slugName)).toList(),
                topic.getIsActive(),
                canonicalUri);
    }

    public static TopicPersonalDetailDTO from(String name, String slugName, String description, CategoryPublicRefDTO category, List<TagPublicRefDTO> tags, Boolean isActive, URI canonicalUri) {
        return new TopicPersonalDetailDTO(
                name,
                slugName,
                description,
                category,
                tags,
                isActive,
                canonicalUri);
    }

    public IFingerprintData getFingerprintData() {
        return new FingerprintData("profile-topic-detail", name, slugName, description, category, tags, isActive, canonicalUri.toString());
    }
}
