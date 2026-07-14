package com.tmb.csnerd.demo.dto.category;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateCategoryDTO(
    @NotBlank @Size(max=256) String name,
    @Size(max=512) String description
) { }
