package com.tmb.csnerd.demo.domain.repositories.post.projections;

public interface PostTagsProjection {
    Long getPostId();
    Long getTagId();
    String getTagSlug();
}
