package com.tmb.csnerd.demo.domain.services.topic;

import com.tmb.csnerd.demo.domain.models.Category;
import com.tmb.csnerd.demo.domain.services.category.CategoryQueryService;
import com.tmb.csnerd.demo.dto.category.CategoryRefDTO;
import com.tmb.csnerd.demo.dto.topic.CreateTopicRequestDTO;
import com.tmb.csnerd.demo.dto.topic.ReplaceTopicRequestDTO;
import com.tmb.csnerd.demo.dto.topic.TopicDetailDTO;
import com.tmb.csnerd.demo.dto.topic.UpdateTopicRequestDTO;
import com.tmb.csnerd.demo.exceptions.ConflictStatusException;
import com.tmb.csnerd.demo.exceptions.category.CategoryNotFoundException;
import com.tmb.csnerd.demo.exceptions.topic.TopicNotFoundException;
import com.tmb.csnerd.demo.domain.models.Topic;
import com.tmb.csnerd.demo.domain.repositories.PostRepository;
import com.tmb.csnerd.demo.domain.repositories.TopicRepository;
import com.tmb.csnerd.demo.utils.SlugifyUtils;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class TopicCommandService {
    private final TopicRepository topicRepository;
    private final PostRepository postRepository;
    private final CategoryQueryService categoryQueryService;

    @CacheEvict(value = "topics", allEntries = true)
    @Transactional
    public TopicDetailDTO createTopic(CreateTopicRequestDTO request) {
        Category category = categoryQueryService.getCategoryById(request.categoryId());
        Topic topic = new Topic();
        topic.setName(request.name());
        topic.setSlugName(SlugifyUtils.slugify(request.name()));
        topic.setDescription(request.description());
        topic.setCategory(category);
        return TopicDetailDTO.from(topicRepository.save(topic));
    }

    @CacheEvict(value = "topics", allEntries = true)
    @Transactional
    public TopicDetailDTO patchTopic(Long topicId, UpdateTopicRequestDTO request) {
        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new TopicNotFoundException(topicId));
        modifyTopicIfChanged(topic, request.name(), request.description(), request.categoryId());
        return TopicDetailDTO.from(topicRepository.save(topic));
    }

    @CacheEvict(value = "topics", allEntries = true)
    @Transactional
    public TopicDetailDTO putTopic(Long topicId, ReplaceTopicRequestDTO request) {
        Topic topic = topicRepository.findById(topicId)
                .orElse(null);
        if (topic == null) {
            topic = new Topic();
        }
        modifyTopicIfChanged(topic, request.name(), request.description(), request.categoryId());
        return TopicDetailDTO.from(topicRepository.save(topic));
    }

    @CacheEvict(value = "topics", allEntries = true)
    @Transactional
    public void deleteTopic(Long topicId) {
        Topic topic = topicRepository.findById(topicId)
            .orElseThrow(() -> new TopicNotFoundException(topicId));
        if (postRepository.existsActiveByTopicId(topicId)) {
            throw new ConflictStatusException("Topic is used by active posts");
        }
        topicRepository.delete(topic);
    }

    private void modifyTopicIfChanged(Topic topic, String newName, String newDescription, Long newCategoryId) {
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
    }
}
