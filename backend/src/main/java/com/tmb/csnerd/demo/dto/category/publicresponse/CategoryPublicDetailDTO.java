package com.tmb.csnerd.demo.dto.category.publicresponse;

import com.tmb.csnerd.demo.domain.models.Category;
import com.tmb.csnerd.demo.domain.services.fingerprint.IFingerprintData;
import com.tmb.csnerd.demo.dto.category.adminresponse.CategoryAdminDetailDTO;

public record CategoryPublicDetailDTO(
    String name,
    String slugName,
    String description
) {
    private record FingerprintData(
            String representation,
            String name,
            String slugName,
            String description
    ) implements IFingerprintData {}

    public static CategoryPublicDetailDTO from(Category category) {
        return new CategoryPublicDetailDTO(category.getName(), category.getSlugName(), category.getDescription());
    }

    public IFingerprintData getFingerprintData() {
        return new FingerprintData("public-category-detail", name, slugName, description);
    }
}
