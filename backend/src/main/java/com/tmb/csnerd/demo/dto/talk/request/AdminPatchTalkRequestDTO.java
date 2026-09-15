package com.tmb.csnerd.demo.dto.talk.request;

import jakarta.validation.constraints.Max;

public record AdminPatchTalkRequestDTO(
    @Max(10_000) String content,
    Boolean isActive
) { }
