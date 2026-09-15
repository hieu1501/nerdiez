package com.tmb.csnerd.demo.domain.repositories.tag.projections;

public record TagUseCountProjection(
    Long postUseCount,
    Long topicUseCount
) {
}
