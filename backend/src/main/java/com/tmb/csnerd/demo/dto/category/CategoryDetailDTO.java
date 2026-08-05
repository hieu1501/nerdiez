package com.tmb.csnerd.demo.dto.category;

import com.tmb.csnerd.demo.domain.models.Category;

public record CategoryDetailDTO(
    Long categoryId,
    String name,
    String slugName,
    String description
) {
    public static CategoryDetailDTO from(Category category) {
        return new CategoryDetailDTO(category.getId(), category.getName(), category.getSlugName(), category.getDescription());
    }
}
