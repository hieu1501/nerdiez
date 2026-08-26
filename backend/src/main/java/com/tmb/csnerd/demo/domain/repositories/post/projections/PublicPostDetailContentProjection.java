package com.tmb.csnerd.demo.domain.repositories.post.projections;

import java.time.Instant;

public interface PublicPostDetailContentProjection {
    Long getId();
    String getSlug();
    String getTitle();
    String getContent();
    String getAuthorName();
    String getCategoryName();
    String getCategorySlug();
    Instant getCreatedAt();
    Instant getUpdatedAt();
    String getFeaturedImage();
    String getDescription();
}
