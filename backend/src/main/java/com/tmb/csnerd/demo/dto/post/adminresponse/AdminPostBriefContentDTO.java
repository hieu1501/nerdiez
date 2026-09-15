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

public record AdminPostBriefContentDTO(
    Long id,
    String slugName,
    String title,
    UserRefDTO author,
    CategoryAdminRefDTO category,
    List<TagAdminRefDTO> tags,
    Instant createdAt,
    Instant updatedAt,
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

    public static AdminPostBriefContentDTO from(Post post, URI canonicalUri) {
        return new AdminPostBriefContentDTO(
            post.getId(),
            post.getSlug(),
            post.getTitle(),
            UserRefDTO.from(post.getAuthor()),
            CategoryAdminRefDTO.from(post.getCategory().getId(), post.getCategory().getName(), post.getCategory().getSlugName()),
            post.getTags().stream().map(TagAdminRefDTO::from).sorted(Comparator.comparing(TagAdminRefDTO::slugName)).toList(),
            post.getCreatedAt(),
            post.getUpdatedAt(),
            post.getIsActive(),
            canonicalUri
        );
    }

    public static AdminPostBriefContentDTO from(Long id, String slug, String title, UserRefDTO author, CategoryAdminRefDTO category, List<TagAdminRefDTO> tags, Instant createdAt, Instant updatedAt, Boolean isActive, URI canonicalUri) {
        return new AdminPostBriefContentDTO(id, slug, title, author, category, tags, createdAt, updatedAt, isActive, canonicalUri);
    }

    public IFingerprintData getFingerprintData() {
        return new FingerprintData("admin-post-brief", id, updatedAt, author, category, tags, canonicalUri.toString());
    }
}
