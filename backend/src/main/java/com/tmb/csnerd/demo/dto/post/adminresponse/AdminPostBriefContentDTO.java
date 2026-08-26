package com.tmb.csnerd.demo.dto.post.adminresponse;

import com.tmb.csnerd.demo.domain.models.Post;
import com.tmb.csnerd.demo.domain.services.fingerprint.IFingerprintData;
import com.tmb.csnerd.demo.dto.category.adminresponse.CategoryAdminRefDTO;
import com.tmb.csnerd.demo.dto.topic.adminresponse.TopicAdminRefDTO;
import com.tmb.csnerd.demo.dto.user.UserRefDTO;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;

public record AdminPostBriefContentDTO(
    Long id,
    String slugName,
    String title,
    UserRefDTO author,
    CategoryAdminRefDTO category,
    List<TopicAdminRefDTO> topics,
    Instant createdAt,
    Instant updatedAt,
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

    public static AdminPostBriefContentDTO from(Post post) {
        return new AdminPostBriefContentDTO(
            post.getId(),
            post.getSlug(),
            post.getTitle(),
            UserRefDTO.from(post.getAuthor()),
            CategoryAdminRefDTO.from(post.getCategory().getId(), post.getCategory().getName(), post.getCategory().getSlugName()),
            post.getTopics().stream().map(TopicAdminRefDTO::from).sorted(Comparator.comparing(TopicAdminRefDTO::slugName)).toList(),
            post.getCreatedAt(),
            post.getUpdatedAt(),
            post.getIsActive()
        );
    }

    public static AdminPostBriefContentDTO from(Long id, String slug, String title, UserRefDTO author, CategoryAdminRefDTO category, List<TopicAdminRefDTO> topics, Instant createdAt, Instant updatedAt, Boolean isActive) {
        return new AdminPostBriefContentDTO(id, slug, title, author, category, topics, createdAt, updatedAt, isActive);
    }

    public IFingerprintData getFingerprintData() {
        return new FingerprintData("admin-post-brief", id, updatedAt, author, category, topics);
    }
}