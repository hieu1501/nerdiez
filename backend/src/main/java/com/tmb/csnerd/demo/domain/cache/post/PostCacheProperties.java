package com.tmb.csnerd.demo.domain.cache.post;

import com.tmb.csnerd.demo.domain.cache.CachePolicy;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.cache.post")
public record PostCacheProperties(
    CachePolicy adminBrief,
    CachePolicy publicBrief,
    CachePolicy adminDetail,
    CachePolicy publicDetail
) { }
