package com.tmb.csnerd.demo.dto.talk.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AdminCreateTalkRequestDTO(
    @NotBlank @Max(10_000) String content,
    @NotNull Long topicId,
    Boolean isActive
) { }
