package com.tmb.csnerd.demo.domain.repositories.post.projections;

import java.time.Instant;

public interface AdminPostDetailContentProjection extends AdminPostBriefContentProjection {
    String getContent();
    String getFeaturedImage();
    String getDescription();
}
