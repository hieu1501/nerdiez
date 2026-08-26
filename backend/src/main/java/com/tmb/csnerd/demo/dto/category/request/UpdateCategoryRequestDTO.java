package com.tmb.csnerd.demo.dto.category.request;

import jakarta.validation.constraints.Size;

public record UpdateCategoryRequestDTO(
    @Size(max=256) String name,
    @Size(max=512) String description,
    Boolean isActive
) { }
