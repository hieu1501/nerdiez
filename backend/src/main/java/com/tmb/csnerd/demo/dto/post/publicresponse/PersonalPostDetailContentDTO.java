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

public record PersonalPostDetailContentDTO(
    String slug,
    String title,
    String content,
    CategoryPublicRefDTO category,
    Instant createdAt,
    Instant updatedAt,
    List<TagPublicRefDTO> tags,
    String featuredImage,
    String description,
    Boolean isActive,
    URI canonicalUri
) {
    private record FingerprintData(
            String representation,
            Instant updatedAt,
            CategoryPublicRefDTO category,
            List<TagPublicRefDTO> tags,
            String canonicalUri
    ) implements IFingerprintData {}

    public static PersonalPostDetailContentDTO from(Post post, String content, String featuredImageUrl, URI canonicalUri) {
        return new PersonalPostDetailContentDTO(
            post.getSlug(),
            post.getTitle(),
            content,
            CategoryPublicRefDTO.from(post.getCategory()),
            post.getCreatedAt(),
            post.getUpdatedAt(),
            post.getTags().stream().map(TagPublicRefDTO::from).sorted(Comparator.comparing(TagPublicRefDTO::slugName)).toList(),
            featuredImageUrl,
            post.getDescription(),
            post.getIsActive(),
            canonicalUri
        );
    }

    public static PersonalPostDetailContentDTO from(String slug, String title, String content, CategoryPublicRefDTO category, Instant createdAt, Instant updatedAt, List<TagPublicRefDTO> tags, String featuredImageUrl, String description, Boolean isActive, URI canonicalUri)  {
        return new PersonalPostDetailContentDTO(slug, title, content, category, createdAt, updatedAt, tags, featuredImageUrl, description, isActive, canonicalUri);
    }

    public IFingerprintData getFingerprintData() {
        return new FingerprintData("profile-post-detail", updatedAt, category, tags, canonicalUri.toString());
    }
}
