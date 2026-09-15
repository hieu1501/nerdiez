package com.tmb.csnerd.demo.domain.cache.tag;

import com.tmb.csnerd.demo.domain.cache.CachePolicy;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.cache.tag")
public record TagCacheProperties(
    CachePolicy adminList,
    CachePolicy publicList
) { }
