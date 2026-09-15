package com.tmb.csnerd.demo.dto.tag.adminresponse;

import com.tmb.csnerd.demo.domain.models.Tag;

public record TagAdminRefDTO(
    Long tagId,
    String slugName
) {
    public static TagAdminRefDTO from(Tag tag) {
        return new TagAdminRefDTO(tag.getId(), tag.getSlug());
    }

    public static TagAdminRefDTO from(Long id, String slugName) {
        return new TagAdminRefDTO(id, slugName);
    }

    public String getFingerprint() {
        return "tag:" + "id=" + tagId + ",slug=" + slugName;
    }
}
