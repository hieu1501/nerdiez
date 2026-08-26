package com.tmb.csnerd.demo.dto.category.adminresponse;

import com.tmb.csnerd.demo.domain.models.Category;
import com.tmb.csnerd.demo.domain.services.fingerprint.IFingerprintData;
import com.tmb.csnerd.demo.dto.category.publicresponse.CategoryPublicRefDTO;
import com.tmb.csnerd.demo.dto.topic.publicresponse.TopicPublicRefDTO;
import com.tmb.csnerd.demo.dto.user.UserRefDTO;

import java.time.Instant;
import java.util.List;

public record CategoryAdminDetailDTO(
    Long categoryId,
    String name,
    String slugName,
    String description,
    Boolean isActive
) {
    private record FingerprintData(
            String representation,
            Long categoryId,
            String name,
            String slugName,
            String description,
            Boolean isActive
    ) implements IFingerprintData {}

    public static CategoryAdminDetailDTO from(Category category) {
        return new CategoryAdminDetailDTO(category.getId(), category.getName(), category.getSlugName(), category.getDescription(), category.getIsActive());
    }

    public IFingerprintData getFingerprintData() {
        return new FingerprintData("admin-category-detail", categoryId, name, slugName, description, isActive);
    }
}
