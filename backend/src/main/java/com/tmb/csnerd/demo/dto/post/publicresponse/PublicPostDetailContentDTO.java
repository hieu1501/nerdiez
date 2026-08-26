package com.tmb.csnerd.demo.dto.post.publicresponse;

import com.tmb.csnerd.demo.domain.models.Post;
import com.tmb.csnerd.demo.domain.services.fingerprint.IFingerprintData;
import com.tmb.csnerd.demo.dto.category.publicresponse.CategoryPublicRefDTO;
import com.tmb.csnerd.demo.dto.topic.publicresponse.TopicPublicRefDTO;
import com.tmb.csnerd.demo.dto.user.UserRefDTO;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;

public record PublicPostDetailContentDTO(
    String slugName,
    String title,
    String content,
    UserRefDTO author,
    CategoryPublicRefDTO category,
    Instant createdAt,
    Instant updatedAt,
    List<TopicPublicRefDTO> topics,
    String featuredImage,
    String description
) {
    private record FingerprintData(
            String representation,
            String slugName,
            Instant updatedAt,
            UserRefDTO author,
            CategoryPublicRefDTO category,
            List<TopicPublicRefDTO> topics
    ) implements IFingerprintData {}

    public static PublicPostDetailContentDTO from(Post post, String content, String featuredImageUrl) {
        return new PublicPostDetailContentDTO(
            post.getSlug(),
            post.getTitle(),
            content,
            UserRefDTO.from(post.getAuthor()),
            CategoryPublicRefDTO.from(post.getCategory()),
            post.getCreatedAt(),
            post.getUpdatedAt(),
            post.getTopics().stream().map(TopicPublicRefDTO::from).sorted(Comparator.comparing(TopicPublicRefDTO::slugName)).toList(),
            featuredImageUrl,
            post.getDescription()
        );
    }

    public static PublicPostDetailContentDTO from(String slug, String title, String content, UserRefDTO author, CategoryPublicRefDTO category, Instant createdAt, Instant updatedAt, List<TopicPublicRefDTO> topics, String featuredImageUrl, String description) {
        return new PublicPostDetailContentDTO(
                slug,
                title,
                content,
                author,
                category,
                createdAt,
                updatedAt,
                topics,
                featuredImageUrl,
                description
        );
    }

    public IFingerprintData getFingerprintData() {
        return new FingerprintData("public-post-detail", slugName, updatedAt, author, category, topics);
    }
}