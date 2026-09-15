package com.tmb.csnerd.demo.domain.repositories.talk.projections;

import java.time.Instant;

public interface AdminTalkContentProjection {
    Long getId();
    String getPublicUri();
    String getContent();
    String getAuthorName();
    Long getTopicId();
    String getTopicName();
    String getTopicSlug();
    String getTopicPublicUri();
    Long getCategoryId();
    String getCategoryName();
    String getCategorySlug();
    Instant getCreatedAt();
    Instant getUpdatedAt();
    Boolean getIsActive();
}
