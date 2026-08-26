package com.tmb.csnerd.demo.domain.repositories.post.projections;

import java.time.Instant;

public interface PublicPostBriefContentProjection {
    Long getId();
    String getSlug();
    String getTitle();
    String getAuthorName();
    String getCategoryName();
    String getCategorySlug();
    Instant getCreatedAt();
    Instant getUpdatedAt();
}
