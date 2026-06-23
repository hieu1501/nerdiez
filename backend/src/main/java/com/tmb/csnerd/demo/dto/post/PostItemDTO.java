package com.tmb.csnerd.demo.dto.post;

import com.tmb.csnerd.demo.models.Category;
import com.tmb.csnerd.demo.models.Topic;

import java.time.LocalDateTime;
import java.util.List;

public record PostItemDTO(
    String title,
    String slug,
    String content,
    String authorUsername,
    Category category,
    LocalDateTime createdAt,
    List<Topic> topics,
    String featuredImage,
    Integer upvoteCount,
    Integer downvoteCount
) {}