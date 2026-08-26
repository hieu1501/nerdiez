package com.tmb.csnerd.demo.dto.post.adminresponse;

import com.tmb.csnerd.demo.domain.models.Post;
import com.tmb.csnerd.demo.domain.services.fingerprint.IFingerprintData;
import com.tmb.csnerd.demo.dto.category.adminresponse.CategoryAdminRefDTO;
import com.tmb.csnerd.demo.dto.topic.adminresponse.TopicAdminRefDTO;
import com.tmb.csnerd.demo.dto.user.UserRefDTO;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;

public record AdminPostDetailContentDTO(
    Long id,
    String slug,
    String title,
    String content,
    UserRefDTO author,
    CategoryAdminRefDTO category,
    Instant createdAt,
    Instant updatedAt,
    List<TopicAdminRefDTO> topics,
    String featuredImage,
    String description,
    Boolean isActive
) {
    private record FingerprintData(
            String representation,
            Long id,
            Instant updatedAt,
            UserRefDTO author,
            CategoryAdminRefDTO category,
            List<TopicAdminRefDTO> topics
    ) implements IFingerprintData {}

    public static AdminPostDetailContentDTO from(Post post, String content, String featuredImageUrl) {
        return new AdminPostDetailContentDTO(
            post.getId(),
            post.getSlug(),
            post.getTitle(),
            content,
            UserRefDTO.from(post.getAuthor()),
            CategoryAdminRefDTO.from(post.getCategory()),
            post.getCreatedAt(),
            post.getUpdatedAt(),
            post.getTopics().stream().map(TopicAdminRefDTO::from).sorted(Comparator.comparing(TopicAdminRefDTO::slugName)).toList(),
            featuredImageUrl,
            post.getDescription(),
            post.getIsActive()
        );
    }

    public static AdminPostDetailContentDTO from(Long id, String slug, String title, String content, UserRefDTO author, CategoryAdminRefDTO category, Instant createdAt, Instant updatedAt, List<TopicAdminRefDTO> topics, String featuredImageUrl, String description, Boolean isActive)  {
        return new AdminPostDetailContentDTO(id, slug, title, content, author, category, createdAt, updatedAt, topics, featuredImageUrl, description, isActive);
    }

    public IFingerprintData getFingerprintData() {
        return new FingerprintData("admin-post-detail", id, updatedAt, author, category, topics);
    }
}