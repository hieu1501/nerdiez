package com.tmb.csnerd.demo.dto.post;

import com.tmb.csnerd.demo.model.Category;
import com.tmb.csnerd.demo.model.Topic;
import com.tmb.csnerd.demo.model.User;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

public record PostItemDTO(
    Integer id,
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