package com.tmb.csnerd.demo.dto.post;

import com.tmb.csnerd.demo.dto.category.CategoryRefDTO;
import com.tmb.csnerd.demo.dto.topic.TopicRefDTO;

import java.time.Instant;
import java.util.Set;

public record AdminPostBriefDTO(
    Long id,
    String title,
    String authorUsername,
    CategoryRefDTO category,
    Instant createdAt,
    Instant updatedAt,
    Integer upvoteCount,
    Integer downvoteCount,
    Boolean isActive
) {}