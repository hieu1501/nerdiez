package com.tmb.csnerd.demo.dto.post.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.Set;

public record AdminCreatePostRequestDTO(
    @NotBlank String title,
    @NotBlank String content,
    String description,
    String featuredImage,
    @NotNull Long categoryId,
    @NotEmpty Set<@NotNull Long> tagIds,
    Boolean isActive
) {}
