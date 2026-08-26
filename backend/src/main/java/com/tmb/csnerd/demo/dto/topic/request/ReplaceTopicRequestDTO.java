package com.tmb.csnerd.demo.dto.topic.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ReplaceTopicRequestDTO(
    @NotBlank @Size(max=256) String name,
    @Size(max=512) String description,
    @NotNull Long categoryId,
    Boolean isActive
) { }
