package com.tmb.csnerd.demo.dto.post.publicresponse;

import com.tmb.csnerd.demo.domain.models.Post;
import com.tmb.csnerd.demo.domain.services.fingerprint.IFingerprintData;
import com.tmb.csnerd.demo.dto.category.publicresponse.CategoryPublicRefDTO;
import com.tmb.csnerd.demo.dto.topic.publicresponse.TopicPublicRefDTO;
import com.tmb.csnerd.demo.dto.user.UserRefDTO;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;

public record PublicPostBriefContentDTO(
    String slugName,
    String title,
    UserRefDTO author,
    CategoryPublicRefDTO category,
    List<TopicPublicRefDTO> topics,
    Instant createdAt,
    Instant updatedAt
) {
    private record FingerprintData(
        String representation,
        String slugName,
        Instant updatedAt,
        UserRefDTO author,
        CategoryPublicRefDTO category,
        List<TopicPublicRefDTO> topics
    ) implements IFingerprintData {}

    public static PublicPostBriefContentDTO from(Post post) {
        return new PublicPostBriefContentDTO(
            post.getSlug(),
            post.getTitle(),
            UserRefDTO.from(post.getAuthor()),
            CategoryPublicRefDTO.from(post.getCategory()),
            post.getTopics().stream().map(TopicPublicRefDTO::from).sorted(Comparator.comparing(TopicPublicRefDTO::slugName)).toList(),
            post.getCreatedAt(),
            post.getUpdatedAt()
        );
    }

    public static PublicPostBriefContentDTO from(String slug, String title, UserRefDTO author, CategoryPublicRefDTO category, List<TopicPublicRefDTO> topics, Instant createdAt, Instant updatedAt) {
        return new PublicPostBriefContentDTO(
                slug,
                title,
                author,
                category,
                topics,
                createdAt,
                updatedAt
        );
    }

    public IFingerprintData getFingerprintData() {
        return new FingerprintData("public-post-brief", slugName, updatedAt, author, category, topics);
    }
}