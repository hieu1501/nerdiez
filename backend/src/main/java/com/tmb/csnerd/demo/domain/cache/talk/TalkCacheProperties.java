package com.tmb.csnerd.demo.domain.cache.talk;

import com.tmb.csnerd.demo.domain.cache.CachePolicy;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.cache.talk")
public record TalkCacheProperties(
    CachePolicy adminBrief,
    CachePolicy publicBrief,
    CachePolicy adminDetail,
    CachePolicy publicDetail,
    CachePolicy vote
) { }
