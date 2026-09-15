package com.tmb.csnerd.demo.dto.talk.request;

import jakarta.validation.constraints.Max;

public record PublicPatchTalkRequestDTO(
    @Max(10_000) String content,
    Boolean isActive
) { }
