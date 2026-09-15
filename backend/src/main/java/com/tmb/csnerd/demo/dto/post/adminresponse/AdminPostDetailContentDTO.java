package com.tmb.csnerd.demo.dto.post.adminresponse;

import com.tmb.csnerd.demo.domain.models.Post;
import com.tmb.csnerd.demo.domain.services.fingerprint.IFingerprintData;
import com.tmb.csnerd.demo.dto.category.adminresponse.CategoryAdminRefDTO;
import com.tmb.csnerd.demo.dto.tag.adminresponse.TagAdminRefDTO;
import com.tmb.csnerd.demo.dto.user.UserRefDTO;

import java.net.URI;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;

public record AdminPostDetailContentDTO(
    Long id,
    String slug,
    String title,
    String content,
    UserRefDTO author,
    CategoryAdminRefDTO category,
    Instant createdAt,
    Instant updatedAt,
    List<TagAdminRefDTO> tags,
    String featuredImage,
    String description,
    Boolean isActive,
    URI canonicalUri
) {
    private record FingerprintData(
            String representation,
            Long id,
            Instant updatedAt,
            UserRefDTO author,
            CategoryAdminRefDTO category,
            List<TagAdminRefDTO> tags,
            String canonicalUri
    ) implements IFingerprintData {}

    public static AdminPostDetailContentDTO from(Post post, String content, String featuredImageUrl, URI canonicalUri) {
        return new AdminPostDetailContentDTO(
            post.getId(),
            post.getSlug(),
            post.getTitle(),
            content,
            UserRefDTO.from(post.getAuthor()),
            CategoryAdminRefDTO.from(post.getCategory()),
            post.getCreatedAt(),
            post.getUpdatedAt(),
            post.getTags().stream().map(TagAdminRefDTO::from).sorted(Comparator.comparing(TagAdminRefDTO::slugName)).toList(),
            featuredImageUrl,
            post.getDescription(),
            post.getIsActive(),
            canonicalUri
        );
    }

    public static AdminPostDetailContentDTO from(Long id, String slug, String title, String content, UserRefDTO author, CategoryAdminRefDTO category, Instant createdAt, Instant updatedAt, List<TagAdminRefDTO> tags, String featuredImageUrl, String description, Boolean isActive, URI canonicalUri)  {
        return new AdminPostDetailContentDTO(id, slug, title, content, author, category, createdAt, updatedAt, tags, featuredImageUrl, description, isActive,canonicalUri);
    }

    public IFingerprintData getFingerprintData() {
        return new FingerprintData("admin-post-detail", id, updatedAt, author, category, tags, canonicalUri.toString());
    }
}
