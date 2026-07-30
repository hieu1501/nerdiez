package com.tmb.csnerd.demo.dto.topic;

import jakarta.validation.constraints.Size;

public record UpdateTopicRequestDTO(
    @Size(max=256) String name,
    @Size(max=512) String description,
    Long categoryId
) { }
