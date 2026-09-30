package com.tmb.csnerd.demo.dto.talk.request;

import jakarta.validation.constraints.Size;

public record PublicPatchTalkRequestDTO(
    @Size(max = 10_000) String content,
    Boolean isActive
) { }
