package com.tmb.csnerd.demo.dto.topic.publicresponse;

import com.tmb.csnerd.demo.domain.models.Topic;
import com.tmb.csnerd.demo.domain.services.fingerprint.IFingerprintData;
import com.tmb.csnerd.demo.dto.category.publicresponse.CategoryPublicRefDTO;
import com.tmb.csnerd.demo.dto.tag.publicresponse.TagPublicRefDTO;
import com.tmb.csnerd.demo.dto.user.UserRefDTO;

import java.net.URI;
import java.util.Comparator;
import java.util.List;

public record TopicPublicDetailDTO(
    String name,
    String slugName,
    String description,
    UserRefDTO author,
    CategoryPublicRefDTO category,
    List<TagPublicRefDTO> tags,
    URI canonicalUri
) {
    private record FingerprintData(
            String representation,
            String name,
            String slugName,
            String description,
            UserRefDTO author,
            CategoryPublicRefDTO category,
            List<TagPublicRefDTO> tags
            ) implements IFingerprintData {}

    public static TopicPublicDetailDTO from(Topic topic, URI canonicalUri) {
        return new TopicPublicDetailDTO(
                topic.getName(),
                topic.getSlug(),
                topic.getDescription(),
                UserRefDTO.from(topic.getAuthor()),
                CategoryPublicRefDTO.from(topic.getCategory()),
                topic.getTags().stream().map(TagPublicRefDTO::from).sorted(Comparator.comparing(TagPublicRefDTO::slugName)).toList(),
                canonicalUri);
    }

    public static TopicPublicDetailDTO from(String name, String slugName, String description, UserRefDTO author, CategoryPublicRefDTO category, List<TagPublicRefDTO> tags, URI canonicalUri) {
        return new TopicPublicDetailDTO(
                name,
                slugName,
                description,
                author,
                category,
                tags,
                canonicalUri);
    }

    public IFingerprintData getFingerprintData() {
        return new FingerprintData("public-topic-detail", name, slugName, description, author, category, tags);
    }
}
