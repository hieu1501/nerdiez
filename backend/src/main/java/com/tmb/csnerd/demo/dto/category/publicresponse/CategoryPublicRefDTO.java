
package com.tmb.csnerd.demo.dto.category.publicresponse;

import com.tmb.csnerd.demo.domain.models.Category;

public record CategoryPublicRefDTO(
    String name,
    String slugName
) {
    public static CategoryPublicRefDTO from(Category category) {
        return new CategoryPublicRefDTO(category.getName(), category.getSlugName());
    }
    public static CategoryPublicRefDTO from(String name, String slugName) {
        return new CategoryPublicRefDTO(name, slugName);
    }

    public String getFingerprint() {
        return "category:" + "slug=" + slugName;
    }
}
