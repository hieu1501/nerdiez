package com.tmb.csnerd.demo.dto.topic;

import jakarta.validation.constraints.NotBlank;

public record ReplaceTopicDTO(
    @NotBlank String name
) { }
