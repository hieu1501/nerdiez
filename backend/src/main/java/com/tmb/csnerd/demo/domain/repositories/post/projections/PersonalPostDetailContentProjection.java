package com.tmb.csnerd.demo.domain.repositories.post.projections;

public interface PersonalPostDetailContentProjection extends AdminPostBriefContentProjection {
    String getContent();
    String getFeaturedImage();
    String getDescription();
}
