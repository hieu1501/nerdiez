package com.tmb.csnerd.demo.dto.category;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ReplaceCategoryDTO(
    @NotBlank @Size(max=256) String name,
    @Size(max=512) String description
) { }
