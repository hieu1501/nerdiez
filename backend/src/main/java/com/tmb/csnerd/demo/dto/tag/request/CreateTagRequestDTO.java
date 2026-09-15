package com.tmb.csnerd.demo.dto.tag.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateTagRequestDTO(
    @NotBlank @Size(max=256) String name,
    Boolean isActive
) { }
