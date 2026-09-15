package com.tmb.csnerd.demo.dto.post.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.Set;

public record PublicCreatePostRequestDTO(
    @NotBlank String title,
    @NotBlank String content,
    String description,
    String featuredImage,
    @NotNull String categorySlug,
    @NotEmpty Set<@NotNull String> tagSlugs,
    Boolean isActive
) {}
