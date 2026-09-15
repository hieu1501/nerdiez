package com.tmb.csnerd.demo.dto.postvote;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record SetPostVoteRequestDTO(
    @NotNull
    @Min(-1)
    @Max(1)
    Byte vote
) {
}
