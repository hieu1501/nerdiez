package com.tmb.csnerd.demo.domain.services.topic;

import com.tmb.csnerd.demo.domain.cache.post.PostListChangedEvent;
import com.tmb.csnerd.demo.domain.cache.topic.TopicChangedEvent;
import com.tmb.csnerd.demo.domain.models.Category;
import com.tmb.csnerd.demo.domain.services.category.CategoryQueryService;
import com.tmb.csnerd.demo.domain.services.post.PostQueryService;
import com.tmb.csnerd.demo.dto.topic.request.CreateTopicRequestDTO;
import com.tmb.csnerd.demo.dto.topic.request.ReplaceTopicRequestDTO;
import com.tmb.csnerd.demo.dto.topic.adminresponse.TopicAdminDetailDTO;
import com.tmb.csnerd.demo.dto.topic.request.UpdateTopicRequestDTO;
import com.tmb.csnerd.demo.exceptions.ConflictStatusException;
import com.tmb.csnerd.demo.exceptions.topic.TopicNotFoundException;
import com.tmb.csnerd.demo.domain.models.Topic;
import com.tmb.csnerd.demo.domain.repositories.post.PostRepository;
import com.tmb.csnerd.demo.domain.repositories.topic.TopicRepository;
import com.tmb.csnerd.demo.utils.SlugifyUtils;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;

@RequiredArgsConstructor
@Service
public class TopicCommandService {
    private final TopicRepository topicRepository;
    private final CategoryQueryService categoryQueryService;
    private final ApplicationEventPublisher eventPublisher;
    private final PostQueryService postQueryService;

    @Transactional
    public TopicAdminDetailDTO createTopic(CreateTopicRequestDTO request) {
        Category category = categoryQueryService.getCategoryById(request.categoryId());
        Topic topic = new Topic();
        topic.setName(request.name());
        topic.setSlugName(SlugifyUtils.slugify(request.name()));
        topic.setDescription(request.description());
        topic.setCategory(category);
        if (request.isActive() != null) topic.setIsActive(request.isActive());
        topic = topicRepository.save(topic);
        eventPublisher.publishEvent(new TopicChangedEvent());
        return TopicAdminDetailDTO.from(topic);
    }

    @Transactional
    public TopicAdminDetailDTO patchTopic(Long topicId, UpdateTopicRequestDTO request) {
        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new TopicNotFoundException(topicId));
        modifyTopicIfChanged(topic, request.name(), request.description(), request.categoryId(), request.isActive());
        topic = topicRepository.save(topic);
        List<Long> modifiedPostIds = postQueryService.getPostIdsByTopicId(topicId);
        if (!modifiedPostIds.isEmpty()) {
            Set<Long> stalePostIds = Set.copyOf(modifiedPostIds);
            eventPublisher.publishEvent(new PostListChangedEvent(stalePostIds));
        }
        eventPublisher.publishEvent(new TopicChangedEvent());
        return TopicAdminDetailDTO.from(topic);
    }

    @Transactional
    public TopicAdminDetailDTO putTopic(Long topicId, ReplaceTopicRequestDTO request) {
        Topic topic = topicRepository.findById(topicId)
                .orElse(null);
        if (topic == null) {
            topic = new Topic();
        }
        modifyTopicIfChanged(topic, request.name(), request.description(), request.categoryId(), request.isActive());
        topic = topicRepository.save(topic);
        List<Long> modifiedPostIds = postQueryService.getPostIdsByTopicId(topicId);
        if (!modifiedPostIds.isEmpty()) {
            Set<Long> stalePostIds = Set.copyOf(modifiedPostIds);
            eventPublisher.publishEvent(new PostListChangedEvent(stalePostIds));
        }
        eventPublisher.publishEvent(new TopicChangedEvent());
        return TopicAdminDetailDTO.from(topic);
    }

    @Transactional
    public void deleteTopic(Long topicId) {
        Topic topic = topicRepository.findById(topicId)
            .orElseThrow(() -> new TopicNotFoundException(topicId));
        if (postQueryService.existsActiveByTopicId(topicId)) {
            throw new ConflictStatusException("Topic is used by active posts");
        }
        topic.setIsActive(false);
        topicRepository.save(topic);
        List<Long> modifiedPostIds = postQueryService.getPostIdsByTopicId(topicId);
        if (!modifiedPostIds.isEmpty()) {
            Set<Long> stalePostIds = Set.copyOf(modifiedPostIds);
            eventPublisher.publishEvent(new PostListChangedEvent(stalePostIds));
        }
        eventPublisher.publishEvent(new TopicChangedEvent());
    }

    private void modifyTopicIfChanged(Topic topic, String newName, String newDescription, Long newCategoryId, Boolean newIsActive) {
        if (topic.getName() == null || (!newName.isBlank() && !topic.getName().equals(newName))) {
            topic.setName(newName);
            topic.setSlugName(SlugifyUtils.slugify(newName));
        }
        if (topic.getDescription() == null || !topic.getDescription().equals(newDescription)) {
            if (newDescription.isBlank()) {
                topic.setDescription(null);
            } else {
                topic.setDescription(newDescription);
            }
        }
        if (topic.getCategory() == null || !topic.getCategory().getId().equals(newCategoryId)) {
            Category category = categoryQueryService.getCategoryById(newCategoryId);
            topic.setCategory(category);
        }
        if (newIsActive != null && !topic.getIsActive().equals(newIsActive)) {
            topic.setIsActive(newIsActive);
        }
    }
}
