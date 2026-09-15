package com.tmb.csnerd.demo.dto.tag.request;

import jakarta.validation.constraints.Size;

public record UpdateTagRequestDTO(
    @Size(max=255) String name,
    Boolean isActive
) { }
