package com.tmb.csnerd.demo.domain.repositories.post.projections;

import java.time.Instant;

public interface PersonalPostBriefContentProjection {
    Long getId();
    String getPublicUri();
    String getSlug();
    String getTitle();
    String getCategoryName();
    String getCategorySlug();
    Instant getCreatedAt();
    Instant getUpdatedAt();
    String getFeaturedImage();
    Boolean getIsActive();
}
