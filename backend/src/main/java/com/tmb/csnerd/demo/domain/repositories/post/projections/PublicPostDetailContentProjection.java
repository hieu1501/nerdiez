package com.tmb.csnerd.demo.domain.repositories.post.projections;

public interface PublicPostDetailContentProjection extends PublicPostBriefContentProjection {
    String getContent();
    String getAuthorName();
}
