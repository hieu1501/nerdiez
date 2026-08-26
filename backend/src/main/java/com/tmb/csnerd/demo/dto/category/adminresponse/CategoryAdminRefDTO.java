
package com.tmb.csnerd.demo.dto.category.adminresponse;

import com.tmb.csnerd.demo.domain.models.Category;

public record CategoryAdminRefDTO(
    Long categoryId,
    String name,
    String slugName
) {
    public static CategoryAdminRefDTO from(Category category) {
        return new CategoryAdminRefDTO(category.getId(), category.getName(), category.getSlugName());
    }
    public static CategoryAdminRefDTO from(Long id, String name, String slugName) {
        return new CategoryAdminRefDTO(id, name, slugName);
    }

    public String getFingerprint() {
        return "category:" + "id=" + categoryId + ",slug=" + slugName;
    }
}
