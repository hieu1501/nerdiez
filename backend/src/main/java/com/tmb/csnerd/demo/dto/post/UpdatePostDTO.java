package com.tmb.csnerd.demo.dto.post;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.Set;

public record UpdatePostDTO(
    String title,
    String content,
    String featuredImage,
    String description,
    Integer categoryId,
    Set<Integer> topicIds
) {}