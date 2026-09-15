package com.tmb.csnerd.demo.domain.repositories.post.projections;

import java.time.Instant;

public interface PublicPostDetailContentProjection extends PublicPostBriefContentProjection {
    String getContent();
    String getFeaturedImage();
    String getDescription();
}
