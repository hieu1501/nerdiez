package com.tmb.csnerd.demo.domain.repositories.post.projections;

import java.time.Instant;

public interface AdminPostBriefContentProjection {
    Long getId();
    String getSlug();
    String getTitle();
    String getAuthorName();
    Long getCategoryId();
    String getCategoryName();
    String getCategorySlug();
    Instant getCreatedAt();
    Instant getUpdatedAt();
    Boolean getIsActive();
}
