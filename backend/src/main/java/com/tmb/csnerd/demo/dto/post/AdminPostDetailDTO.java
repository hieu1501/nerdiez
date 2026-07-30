package com.tmb.csnerd.demo.dto.post;

import com.tmb.csnerd.demo.dto.category.CategoryRefDTO;
import com.tmb.csnerd.demo.dto.topic.TopicRefDTO;

import java.time.Instant;
import java.util.Set;

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
    Integer upvoteCount,
    Integer downvoteCount,
    Boolean isActive
) {}