package com.tmb.csnerd.demo.domain.repositories.post.projections;

public interface PostTopicsProjection {
    Long getPostId();
    Long getTopicId();
    String getTopicName();
    String getTopicSlug();
}
