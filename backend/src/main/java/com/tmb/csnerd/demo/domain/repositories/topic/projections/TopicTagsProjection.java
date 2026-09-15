package com.tmb.csnerd.demo.domain.repositories.topic.projections;

public interface TopicTagsProjection {
    Long getTopicId();
    Long getTagId();
    String getTagSlug();
}
