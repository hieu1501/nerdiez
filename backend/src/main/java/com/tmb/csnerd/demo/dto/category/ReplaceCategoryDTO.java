package com.tmb.csnerd.demo.dto.category;

import jakarta.validation.constraints.NotBlank;

public record ReplaceCategoryDTO(
  @NotBlank String name
) { }
