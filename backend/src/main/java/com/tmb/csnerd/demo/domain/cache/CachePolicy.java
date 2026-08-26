package com.tmb.csnerd.demo.domain.cache;

import java.time.Duration;

public record CachePolicy(
    Duration ttl,
    long maximumSize
) {}
