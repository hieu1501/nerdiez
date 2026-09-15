package com.tmb.csnerd.demo.dto.talkvote;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record SetTalkVoteRequestDTO(
    @NotNull @Min(-1) @Max(1) Byte vote
) { }
