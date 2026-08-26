package com.tmb.csnerd.demo.domain.cache.topic;

import com.tmb.csnerd.demo.domain.cache.CachePolicy;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.cache.topic")
public record TopicCacheProperties(
    CachePolicy adminList,
    CachePolicy publicList
) { }
