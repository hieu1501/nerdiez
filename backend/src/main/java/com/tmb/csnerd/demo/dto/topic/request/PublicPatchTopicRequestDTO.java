package com.tmb.csnerd.demo.dto.topic.request;

import jakarta.validation.constraints.NotNull;

import java.util.Set;

public record PublicPatchTopicRequestDTO(
    String name,
    String description,
    String categorySlug,
    Set<@NotNull String> tagSlugs
) {}
