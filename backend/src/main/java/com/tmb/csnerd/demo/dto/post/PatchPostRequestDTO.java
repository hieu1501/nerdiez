package com.tmb.csnerd.demo.dto.post;

import java.util.Set;

public record PatchPostRequestDTO(
    String title,
    String content,
    String featuredImage,
    String description,
    Long categoryId,
    Set<Long> topicIds,
    Boolean isActive
) {}