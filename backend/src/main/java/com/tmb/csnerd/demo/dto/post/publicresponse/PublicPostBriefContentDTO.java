package com.tmb.csnerd.demo.dto.post.publicresponse;

import com.tmb.csnerd.demo.domain.models.Post;
import com.tmb.csnerd.demo.domain.services.fingerprint.IFingerprintData;
import com.tmb.csnerd.demo.dto.category.publicresponse.CategoryPublicRefDTO;
import com.tmb.csnerd.demo.dto.tag.publicresponse.TagPublicRefDTO;
import com.tmb.csnerd.demo.dto.user.UserRefDTO;

import java.net.URI;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;

public record PublicPostBriefContentDTO(
    String slugName,
    String title,
    UserRefDTO author,
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
        UserRefDTO author,
        CategoryPublicRefDTO category,
        List<TagPublicRefDTO> tags
    ) implements IFingerprintData {}

    public static PublicPostBriefContentDTO from(Post post, String featuredImage, URI canonicalUri) {
        return new PublicPostBriefContentDTO(
            post.getSlug(),
            post.getTitle(),
            UserRefDTO.from(post.getAuthor()),
            CategoryPublicRefDTO.from(post.getCategory()),
            post.getTags().stream().map(TagPublicRefDTO::from).sorted(Comparator.comparing(TagPublicRefDTO::slugName)).toList(),
            post.getCreatedAt(),
            post.getUpdatedAt(),
            featuredImage,
            canonicalUri
        );
    }

    public static PublicPostBriefContentDTO from(String slug, String title, UserRefDTO author, CategoryPublicRefDTO category, List<TagPublicRefDTO> tags, Instant createdAt, Instant updatedAt, String featuredImage, URI canonicalUri) {
        return new PublicPostBriefContentDTO(
                slug,
                title,
                author,
                category,
                tags,
                createdAt,
                updatedAt,
                featuredImage,
                canonicalUri
        );
    }

    public IFingerprintData getFingerprintData() {
        return new FingerprintData("public-post-brief", slugName, updatedAt, author, category, tags);
    }
}
