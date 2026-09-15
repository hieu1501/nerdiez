package com.tmb.csnerd.demo.dto.post.request;

import jakarta.validation.constraints.NotNull;

import java.util.Set;

public record AdminPatchPostRequestDTO(
    String title,
    String content,
    String featuredImage,
    String description,
    Set<@NotNull Long> tagIds,
    Boolean isActive
) {}
