package com.tmb.csnerd.demo.dto.tag.publicresponse;

import com.tmb.csnerd.demo.domain.models.Tag;
import com.tmb.csnerd.demo.domain.services.fingerprint.IFingerprintData;

public record TagPublicDetailDTO(
    String slugName
) {
    private record FingerprintData(
            String representation,
            String slugName
    ) implements IFingerprintData {}

    public static TagPublicDetailDTO from(Tag tag) {
        return new TagPublicDetailDTO(tag.getSlug());
    }

    public IFingerprintData getFingerprintData() {
        return new FingerprintData("public-tag-detail", slugName);
    }
}
