package com.tmb.csnerd.demo.domain.cache.category;

import com.tmb.csnerd.demo.domain.cache.CachePolicy;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.cache.category")
public record CategoryCacheProperties(
    CachePolicy adminList,
    CachePolicy publicList
) { }
