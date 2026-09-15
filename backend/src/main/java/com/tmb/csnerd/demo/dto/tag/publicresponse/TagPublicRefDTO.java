package com.tmb.csnerd.demo.dto.tag.publicresponse;

import com.tmb.csnerd.demo.domain.models.Tag;

public record TagPublicRefDTO(
    String slugName
) {
    public static TagPublicRefDTO from(Tag tag) {
        return new TagPublicRefDTO(tag.getSlug());
    }

    public static TagPublicRefDTO from(String slugName) {
        return new TagPublicRefDTO(slugName);
    }

    public String getFingerprint() {
        return "tag:" + "slug=" + slugName;
    }
}
