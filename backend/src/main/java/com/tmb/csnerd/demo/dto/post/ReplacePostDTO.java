package com.tmb.csnerd.demo.dto.post;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.Set;

public record ReplacePostDTO(
    @NotBlank String title,
    @NotBlank String content,
    String featuredImage,
    String description,
    @NotNull Integer categoryId,
    Set<Integer> topicIds
) {}