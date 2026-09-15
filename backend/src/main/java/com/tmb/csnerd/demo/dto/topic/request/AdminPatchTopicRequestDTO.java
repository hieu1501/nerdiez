package com.tmb.csnerd.demo.dto.topic.request;

import jakarta.validation.constraints.NotNull;

import java.util.Set;

public record AdminPatchTopicRequestDTO(
    String name,
    String description,
    Set<@NotNull Long> tagIds,
    Boolean isActive
) {}
