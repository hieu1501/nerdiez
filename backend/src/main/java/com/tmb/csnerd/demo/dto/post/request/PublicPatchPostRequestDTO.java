package com.tmb.csnerd.demo.dto.post.request;

import jakarta.validation.constraints.NotNull;

import java.util.Set;

public record PublicPatchPostRequestDTO(
    String title,
    String content,
    String featuredImage,
    String description,
    Set<@NotNull String> tagSlugs,
    Boolean isActive
) {}
