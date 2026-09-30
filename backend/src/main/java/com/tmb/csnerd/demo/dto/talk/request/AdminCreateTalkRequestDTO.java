package com.tmb.csnerd.demo.dto.talk.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AdminCreateTalkRequestDTO(
    @NotBlank @Size(max = 10_000) String content,
    @NotNull Long topicId,
    Boolean isActive
) { }
