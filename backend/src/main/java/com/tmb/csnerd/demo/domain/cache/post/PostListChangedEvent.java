package com.tmb.csnerd.demo.domain.cache.post;

import java.util.Set;

public record PostListChangedEvent(Set<Long> postIds) {
}
