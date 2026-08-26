package com.tmb.csnerd.demo.domain.repositories.post.projections;

import java.time.Instant;

public interface AdminPostDetailContentProjection {
    Long getId();
    String getSlug();
    String getTitle();
    String getContent();
    String getAuthorName();
    Long getCategoryId();
    String getCategoryName();
    String getCategorySlug();
    Instant getCreatedAt();
    Instant getUpdatedAt();
    String getFeaturedImage();
    String getDescription();
    Boolean getIsActive();
}
