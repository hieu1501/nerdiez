package com.tmb.csnerd.demo.dto.topic.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.Set;

public record PublicCreateTopicRequestDTO(
    @NotBlank @Size(max=256) String name,
    @Size(max=512) String description,
    @NotNull String categorySlug,
    @NotEmpty Set<@NotNull String> tagSlugs
) { }
