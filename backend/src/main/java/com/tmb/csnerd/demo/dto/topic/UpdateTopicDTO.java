package com.tmb.csnerd.demo.dto.topic;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UpdateTopicDTO(
    @Size(max=256) String name,
    @Size(max=512) String description,
    Long categoryId
) { }
