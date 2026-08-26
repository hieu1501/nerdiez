package com.tmb.csnerd.demo.domain.config;

import com.github.benmanes.caffeine.cache.CacheLoader;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.github.benmanes.caffeine.cache.LoadingCache;
import com.tmb.csnerd.demo.domain.cache.CachePolicy;
import com.tmb.csnerd.demo.domain.cache.category.CategoryCacheProperties;
import com.tmb.csnerd.demo.domain.cache.post.PostCacheProperties;
import com.tmb.csnerd.demo.domain.cache.topic.TopicCacheProperties;
import com.tmb.csnerd.demo.domain.services.category.CategoryContentLoader;
import com.tmb.csnerd.demo.domain.services.post.PostContentLoader;
import com.tmb.csnerd.demo.domain.services.topic.TopicContentLoader;
import com.tmb.csnerd.demo.dto.category.adminresponse.CategoryAdminDetailDTO;
import com.tmb.csnerd.demo.dto.category.publicresponse.CategoryPublicDetailDTO;
import com.tmb.csnerd.demo.dto.common.CachedContent;
import com.tmb.csnerd.demo.dto.post.adminresponse.AdminPostBriefContentDTO;
import com.tmb.csnerd.demo.dto.post.adminresponse.AdminPostDetailContentDTO;
import com.tmb.csnerd.demo.dto.post.publicresponse.PublicPostBriefContentDTO;
import com.tmb.csnerd.demo.dto.post.publicresponse.PublicPostDetailContentDTO;
import com.tmb.csnerd.demo.dto.topic.adminresponse.TopicAdminDetailDTO;
import com.tmb.csnerd.demo.dto.topic.publicresponse.TopicPublicDetailDTO;
import org.jspecify.annotations.NullMarked;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.function.Supplier;

@Configuration
@EnableCaching
@EnableConfigurationProperties({PostCacheProperties.class, CategoryCacheProperties.class, TopicCacheProperties.class})
public class CacheConfig {

    @Bean("adminPostListCache")
    LoadingCache<Long, CachedContent<AdminPostBriefContentDTO>> adminPostListCache(PostContentLoader postContentLoader, PostCacheProperties properties) {
        return buildBulkCache(properties.adminBrief(), postContentLoader::loadAdminPostBriefContentByIds);
    }

    @Bean("publicPostListCache")
    LoadingCache<Long, CachedContent<PublicPostBriefContentDTO>> publicPostListCache(PostContentLoader postContentLoader, PostCacheProperties properties) {
        return buildBulkCache(properties.publicBrief(), postContentLoader::loadPublicPostBriefContentByIds);
    }

    @Bean("adminPostDetailCache")
    LoadingCache<Long, CachedContent<AdminPostDetailContentDTO>> adminPostDetailCache(PostContentLoader postContentLoader, PostCacheProperties properties) {
        return buildSingleCache(properties.adminDetail(), postContentLoader::loadAdminPostDetailContentById);
    }

    @Bean("publicPostDetailCache")
    LoadingCache<Long, CachedContent<PublicPostDetailContentDTO>> publicPostDetailCache(PostContentLoader postContentLoader, PostCacheProperties properties) {
        return buildSingleCache(properties.publicDetail(), postContentLoader::loadPublicPostDetailContentById);
    }

    @Bean("adminCategoryListCache")
    LoadingCache<String, CachedContent<List<CategoryAdminDetailDTO>>> adminCategoryListCache(CategoryContentLoader categoryContentLoader, CategoryCacheProperties properties) {
        return buildSingleCacheForListing(properties.adminList(), categoryContentLoader::loadAllCategoriesForAdmin);
    }

    @Bean("publicCategoryListCache")
    LoadingCache<String, CachedContent<List<CategoryPublicDetailDTO>>> publicCategoryListCache(CategoryContentLoader categoryContentLoader, CategoryCacheProperties properties) {
        return buildSingleCacheForListing(properties.publicList(), categoryContentLoader::loadAllCategoriesForPublic);
    }

    @Bean("adminTopicListCache")
    LoadingCache<Long, List<TopicAdminDetailDTO>> adminTopicListCache(TopicContentLoader topicContentLoader, TopicCacheProperties properties) {
        return buildBulkCache(properties.adminList(), topicContentLoader::loadAdminTopicsByCategoryIds);
    }

    @Bean("publicTopicListCache")
    LoadingCache<Long, List<TopicPublicDetailDTO>> publicTopicListCache(TopicContentLoader topicContentLoader, TopicCacheProperties properties) {
        return buildBulkCache(properties.publicList(), topicContentLoader::loadPublicTopicsByCategoryIds);
    }

    private static <V> LoadingCache<Long, V> buildBulkCache(CachePolicy policy, Function<Set<Long>, Map<Long, V>> loader) {
        return Caffeine.newBuilder()
            .maximumSize(policy.maximumSize())
            .expireAfterWrite(policy.ttl())
            .recordStats()
            .build(new CacheLoader<Long, V>() {
                @NullMarked
                @Override
                public V load(Long id) {
                    return loader.apply(Set.of(id)).get(id);
                }

                @NullMarked
                @Override
                public Map<? extends Long, ? extends V> loadAll(Set<? extends Long> ids) {
                    Set<Long> copiedIds = new LinkedHashSet<>(ids);
                    return loader.apply(copiedIds);
                }
            });
    }

    private static <V> LoadingCache<Long, V> buildSingleCache(CachePolicy policy, Function<Long, V> loader) {
        return Caffeine.newBuilder()
                .maximumSize(policy.maximumSize())
                .expireAfterWrite(policy.ttl())
                .recordStats()
                .build(loader::apply);
    }

    private static <V> LoadingCache<String, V> buildSingleCacheForListing(CachePolicy policy, Supplier<V> loader) {
        return Caffeine.newBuilder()
                .maximumSize(policy.maximumSize())
                .expireAfterWrite(policy.ttl())
                .recordStats()
                .build(ignored -> loader.get());
    }
}
