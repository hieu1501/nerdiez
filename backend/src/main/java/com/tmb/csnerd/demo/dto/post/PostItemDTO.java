package com.tmb.csnerd.demo.dto.post;

import com.tmb.csnerd.demo.domain.models.Category;
import com.tmb.csnerd.demo.domain.models.Topic;

import java.time.Instant;
import java.util.List;

public record PostItemDTO(
    String title,
    String slug,
    String content,
    String authorUsername,
    Category category,
    Instant createdAt,
    List<Topic> topics,
    String featuredImage,
    Integer upvoteCount,
    Integer downvoteCount
) {}