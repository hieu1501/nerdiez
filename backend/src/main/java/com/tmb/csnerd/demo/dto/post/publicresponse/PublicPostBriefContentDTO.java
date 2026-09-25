package com.tmb.csnerd.demo.dto.post.publicresponse;

import com.tmb.csnerd.demo.domain.models.Post;
import com.tmb.csnerd.demo.domain.services.fingerprint.IFingerprintData;
import com.tmb.csnerd.demo.dto.category.publicresponse.CategoryPublicRefDTO;
import com.tmb.csnerd.demo.dto.tag.publicresponse.TagPublicRefDTO;

import java.net.URI;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;

public record PublicPostBriefContentDTO(
    String slugName,
    String title,
    String description,
    CategoryPublicRefDTO category,
    List<TagPublicRefDTO> tags,
    Instant createdAt,
    Instant updatedAt,
    String featuredImage,
    URI canonicalUri
) {
    private record FingerprintData(
        String representation,
        String slugName,
        Instant updatedAt,
        String description,
        CategoryPublicRefDTO category,
        List<TagPublicRefDTO> tags
    ) implements IFingerprintData {}

    public static PublicPostBriefContentDTO from(Post post, String featuredImage, URI canonicalUri) {
        return new PublicPostBriefContentDTO(
            post.getSlug(),
            post.getTitle(),
            post.getDescription(),
            CategoryPublicRefDTO.from(post.getCategory()),
            post.getTags().stream().map(TagPublicRefDTO::from).sorted(Comparator.comparing(TagPublicRefDTO::slugName)).toList(),
            post.getCreatedAt(),
            post.getUpdatedAt(),
            featuredImage,
            canonicalUri
        );
    }

    public static PublicPostBriefContentDTO from(String slug, String title, String description, CategoryPublicRefDTO category, List<TagPublicRefDTO> tags, Instant createdAt, Instant updatedAt, String featuredImage, URI canonicalUri) {
        return new PublicPostBriefContentDTO(
                slug,
                title,
                description,
                category,
                tags,
                createdAt,
                updatedAt,
                featuredImage,
                canonicalUri
        );
    }

    public IFingerprintData getFingerprintData() {
        return new FingerprintData("public-post-brief:v2", slugName, updatedAt, description, category, tags);
    }
}
