package com.tmb.csnerd.demo.dto.post;

import com.tmb.csnerd.demo.model.Category;
import com.tmb.csnerd.demo.model.Topic;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.Set;

public record CreatePostDTO(
    @NotBlank String title,
    @NotBlank String content,
    String featuredImage,
    String description,
    @NotNull Long categoryId,
    Set<Long> topicIds
) {}