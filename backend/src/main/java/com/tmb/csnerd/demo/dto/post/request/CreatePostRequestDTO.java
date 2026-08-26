package com.tmb.csnerd.demo.dto.post.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.Set;

public record CreatePostRequestDTO(
    @NotBlank String title,
    @NotBlank String content,
    String description,
    String featuredImage,
    @NotNull Long categoryId,
    Set<Long> topicIds,
    Boolean isActive
) {}