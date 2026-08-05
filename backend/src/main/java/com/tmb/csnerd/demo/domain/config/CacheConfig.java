package com.tmb.csnerd.demo.domain.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCache;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.cache.support.SimpleCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;
import java.util.List;

@Configuration
@EnableCaching
public class CacheConfig {
    @Bean
    public CacheManager cacheManager() {
        CaffeineCache postAdminList = new CaffeineCache(
            "post-admin-list",
            Caffeine.newBuilder()
                .expireAfterWrite(Duration.ofMinutes(30))
                .expireAfterAccess(Duration.ofMinutes(5))
                .maximumSize(200)
                .build()
        );
        CaffeineCache postPublicList = new CaffeineCache(
            "post-public-list",
            Caffeine.newBuilder()
                .expireAfterWrite(Duration.ofMinutes(5))
                .maximumSize(500)
                .build()
        );
        CaffeineCache postDetail = new CaffeineCache(
            "post-detail",
            Caffeine.newBuilder()
                    .expireAfterWrite(Duration.ofMinutes(30))
                    .maximumSize(1000)
                    .build()
        );

        CaffeineCache categories = new CaffeineCache(
            "categories",
            Caffeine.newBuilder()
                    .expireAfterWrite(Duration.ofHours(1))
                    .maximumSize(50)
                    .build()
        );

        CaffeineCache topics = new CaffeineCache(
            "topics",
            Caffeine.newBuilder()
                    .expireAfterWrite(Duration.ofHours(1))
                    .maximumSize(100)
                    .build()
        );

        SimpleCacheManager cacheManager = new SimpleCacheManager();
        cacheManager.setCaches(List.of(
                postAdminList,
                postPublicList,
                postDetail,
                categories,
                topics
        ));

        return cacheManager;
    }
}
