package com.tmb.csnerd.demo.dto.category;

public record CategoryResponseDTO(
    Long categoryId,
    String name,
    String slugName,
    String description
) { }
