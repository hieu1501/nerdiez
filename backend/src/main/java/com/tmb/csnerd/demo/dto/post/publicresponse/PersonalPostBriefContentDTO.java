package com.tmb.csnerd.demo.dto.post.publicresponse;

import com.tmb.csnerd.demo.domain.models.Post;
import com.tmb.csnerd.demo.domain.services.fingerprint.IFingerprintData;
import com.tmb.csnerd.demo.dto.category.adminresponse.CategoryAdminRefDTO;
import com.tmb.csnerd.demo.dto.category.publicresponse.CategoryPublicRefDTO;
import com.tmb.csnerd.demo.dto.tag.adminresponse.TagAdminRefDTO;
import com.tmb.csnerd.demo.dto.tag.publicresponse.TagPublicRefDTO;
import com.tmb.csnerd.demo.dto.user.UserRefDTO;

import java.net.URI;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;

public record PersonalPostBriefContentDTO(
    String slugName,
    String title,
    CategoryPublicRefDTO category,
    List<TagPublicRefDTO> tags,
    Instant createdAt,
    Instant updatedAt,
    String featuredImage,
    Boolean isActive,
    URI canonicalUri
) {
    private record FingerprintData(
            String representation,
            Instant updatedAt,
            CategoryPublicRefDTO category,
            List<TagPublicRefDTO> tags,
            Boolean isActive,
            String canonicalUri
    ) implements IFingerprintData {}

    public static PersonalPostBriefContentDTO from(Post post, String featuredImage, URI canonicalUri) {
        return new PersonalPostBriefContentDTO(
            post.getSlug(),
            post.getTitle(),
            CategoryPublicRefDTO.from(post.getCategory()),
            post.getTags().stream().map(TagPublicRefDTO::from).sorted(Comparator.comparing(TagPublicRefDTO::slugName)).toList(),
            post.getCreatedAt(),
            post.getUpdatedAt(),
            featuredImage,
            post.getIsActive(),
            canonicalUri
        );
    }

    public static PersonalPostBriefContentDTO from(String slug, String title, CategoryPublicRefDTO category, List<TagPublicRefDTO> tags, Instant createdAt, Instant updatedAt, String featuredImage, Boolean isActive, URI canonicalUri) {
        return new PersonalPostBriefContentDTO(slug, title, category, tags, createdAt, updatedAt, featuredImage, isActive, canonicalUri);
    }

    public IFingerprintData getFingerprintData() {
        return new FingerprintData("profile-post-brief", updatedAt, category, tags, isActive, canonicalUri.toString());
    }
}
