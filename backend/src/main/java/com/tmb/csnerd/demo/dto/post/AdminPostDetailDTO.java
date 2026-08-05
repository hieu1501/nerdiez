package com.tmb.csnerd.demo.dto.post;

import com.tmb.csnerd.demo.domain.models.Post;
import com.tmb.csnerd.demo.dto.category.CategoryRefDTO;
import com.tmb.csnerd.demo.dto.topic.TopicRefDTO;

import java.time.Instant;
import java.util.Set;
import java.util.stream.Collectors;

public record AdminPostDetailDTO(
    Long id,
    String title,
    String content,
    String authorUsername,
    CategoryRefDTO category,
    Instant createdAt,
    Instant updatedAt,
    Set<TopicRefDTO> topics,
    String featuredImage,
    String description,
    Long upvoteCount,
    Long downvoteCount,
    Boolean isActive
) {
    public static AdminPostDetailDTO from(Post post, String content, String featuredImageUrl) {
        return new AdminPostDetailDTO(
            post.getId(),
            post.getTitle(),
            content,
            post.getAuthor().getUsername(),
            CategoryRefDTO.from(post.getCategory()),
            post.getCreatedAt(),
            post.getUpdatedAt(),
            post.getTopics().stream().map(TopicRefDTO::from).collect(Collectors.toSet()),
            featuredImageUrl,
            post.getPostMetadata().getDescription(),
            post.getVoteCount().getFirst(),
            post.getVoteCount().getSecond(),
            post.getIsActive()
        );
    }
}