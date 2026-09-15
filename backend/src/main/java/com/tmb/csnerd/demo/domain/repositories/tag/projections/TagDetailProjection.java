package com.tmb.csnerd.demo.domain.repositories.tag.projections;

public record TagDetailProjection(
    Long id,
    String slug,
    Long postUseCount,
    Long topicUseCount,
    Boolean isActive
) {
}
