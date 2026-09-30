package com.tmb.csnerd.demo.dto.talk.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Size;

public record AdminPatchTalkRequestDTO(
    @Size(max = 10_000)String content,
    Boolean isActive
) { }
