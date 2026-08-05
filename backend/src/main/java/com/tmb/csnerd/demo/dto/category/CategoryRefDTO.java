
package com.tmb.csnerd.demo.dto.category;

import com.tmb.csnerd.demo.domain.models.Category;
import com.tmb.csnerd.demo.domain.models.Post;

public record CategoryRefDTO(
    Long categoryId,
    String name
) {
    public static CategoryRefDTO from(Category category) {
        return new CategoryRefDTO(category.getId(), category.getName());
    }
}
