package com.tmb.csnerd.demo.dto.category;

public record CategoryDetailDTO(
    Long categoryId,
    String name,
    String slugName,
    String description
) { }
