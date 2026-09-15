package com.tmb.csnerd.demo.dto.tag.adminresponse;

import com.tmb.csnerd.demo.domain.models.Tag;
import com.tmb.csnerd.demo.domain.services.fingerprint.IFingerprintData;

public record TagAdminDetailDTO(
    Long tagId,
    String slugName,
    Long postUseCount,
    Long topicUseCount,
    Boolean isActive
) {
    private record FingerprintData(
            String representation,
            Long tagId,
            String slugName,
            Long postUseCount,
            Long topicUseCount,
            Boolean isActive
    ) implements IFingerprintData {}

    public static TagAdminDetailDTO from(Tag tag, Long postUseCount, Long topicUseCount) {
        return new TagAdminDetailDTO(tag.getId(), tag.getSlug(), postUseCount, topicUseCount, tag.getIsActive());
    }

    public static TagAdminDetailDTO from(Long tagId, String slugName, Long postUseCount, Long topicUseCount, Boolean isActive) {
        return new TagAdminDetailDTO(tagId, slugName, postUseCount, topicUseCount, isActive);
    }

    public IFingerprintData getFingerprintData() {
        return new FingerprintData("admin-tag-detail", tagId, slugName, postUseCount, topicUseCount, isActive);
    }
}
