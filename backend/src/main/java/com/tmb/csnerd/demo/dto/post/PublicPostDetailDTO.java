package com.tmb.csnerd.demo.dto.post;

import com.tmb.csnerd.demo.domain.models.Post;
import com.tmb.csnerd.demo.dto.category.CategoryRefDTO;
import com.tmb.csnerd.demo.dto.topic.TopicRefDTO;
import org.springframework.data.util.Pair;

import java.time.Instant;
import java.util.Set;
import java.util.stream.Collectors;

public record PublicPostDetailDTO(
    Long id,
    String title,
    String slug,
    String content,
    String authorUsername,
    CategoryRefDTO category,
    Instant createdAt,
    Set<TopicRefDTO> topics,
    String featuredImage,
    String description,
    Long upvoteCount,
    Long downvoteCount
) {
    public static PublicPostDetailDTO from(Post post, String content, String featuredImageUrl) {
        return new PublicPostDetailDTO(
            post.getId(),
            post.getTitle(),
            post.getSlug(),
            content,
            post.getAuthor().getUsername(),
            CategoryRefDTO.from(post.getCategory()),
            post.getCreatedAt(),
            post.getTopics().stream().map(TopicRefDTO::from).collect(Collectors.toSet()),
            featuredImageUrl,
            post.getPostMetadata().getDescription(),
            post.getVoteCount().getFirst(),
            post.getVoteCount().getSecond()
        );
    }
}