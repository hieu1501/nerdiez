package com.tmb.csnerd.demo.dto.post;

import com.tmb.csnerd.demo.domain.models.Post;
import java.time.Instant;

public record AdminPostBriefDTO(
    Long id,
    String title,
    String authorUsername,
    Long categoryId,
    String categoryName,
    Instant createdAt,
    Instant updatedAt,
    Long upvoteCount,
    Long downvoteCount,
    Boolean isActive
) {
    public static AdminPostBriefDTO from(Post post) {
        return new AdminPostBriefDTO(
            post.getId(),
            post.getTitle(),
            post.getAuthor().getUsername(),
            post.getCategory().getId(),
            post.getCategory().getName(),
            post.getCreatedAt(),
            post.getUpdatedAt(),
            post.getVoteCount().getFirst(),
            post.getVoteCount().getSecond(),
            post.getIsActive()
        );
    }
}