package com.tmb.csnerd.demo.domain.services.topic;

import com.tmb.csnerd.demo.domain.models.Topic;
import com.tmb.csnerd.demo.domain.repositories.topic.TopicRepository;
import com.tmb.csnerd.demo.domain.services.category.CategoryQueryService;
import com.tmb.csnerd.demo.dto.common.CachedContent;
import com.tmb.csnerd.demo.dto.common.ETagResponse;
import com.tmb.csnerd.demo.dto.topic.adminresponse.TopicAdminDetailDTO;
import com.tmb.csnerd.demo.dto.topic.publicresponse.TopicPublicDetailDTO;
import com.tmb.csnerd.demo.utils.ETagFactory;
import lombok.AllArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@AllArgsConstructor
@Service
public class TopicQueryService {
    private final TopicCacheableService topicCacheableService;
    private final ETagFactory eTagFactory;
    private final TopicRepository topicRepository;
    private final CategoryQueryService categoryQueryService;

    public ETagResponse<List<TopicAdminDetailDTO>> getAllTopicsForAdmin() {
        List<Long> categoryIds = categoryQueryService.getAllCategoryIds();
        CachedContent<List<TopicAdminDetailDTO>> listContent = topicCacheableService.getAdminTopicListByCategoryIds(categoryIds);
        List<String> componentsForETag = new ArrayList<>();
        componentsForETag.add("admin-topic-list:v1");
        componentsForETag.add(listContent.fingerprint());
        String eTag = eTagFactory.weakETag(componentsForETag.toArray(String[]::new));
        return ETagResponse.from(listContent.content(), eTag);
    }

    public ETagResponse<List<TopicPublicDetailDTO>> getAllTopicsForPublic() {
        List<Long> categoryIds = categoryQueryService.getAllActiveCategoryIds();
        CachedContent<List<TopicPublicDetailDTO>> listContent = topicCacheableService.getPublicTopicListByCategoryIds(categoryIds);
        List<String> componentsForETag = new ArrayList<>();
        componentsForETag.add("public-topic-list:v1");
        componentsForETag.add(listContent.fingerprint());
        String eTag = eTagFactory.weakETag(componentsForETag.toArray(String[]::new));
        return ETagResponse.from(listContent.content(), eTag);
    }

    public List<Topic> findTopicsByIds(Set<Long> ids) {
        return topicRepository.findAllById(ids);
    }
}
