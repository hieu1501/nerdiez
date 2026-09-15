package com.tmb.csnerd.demo.domain.repositories.talk.projections;

import java.time.Instant;

public interface ProfileTalkContentProjection {
    Long getId();
    String getPublicUri();
    String getContent();
    String getTopicName();
    String getTopicSlug();
    String getTopicPublicUri();
    String getCategoryName();
    String getCategorySlug();
    Instant getCreatedAt();
    Instant getUpdatedAt();
    Boolean getIsActive();
}
