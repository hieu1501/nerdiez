package com.tmb.csnerd.demo.domain.services.topic;

import com.tmb.csnerd.demo.domain.models.Category;
import com.tmb.csnerd.demo.domain.services.category.CategoryQueryService;
import com.tmb.csnerd.demo.dto.topic.CreateTopicDTO;
import com.tmb.csnerd.demo.dto.topic.ReplaceTopicDTO;
import com.tmb.csnerd.demo.dto.topic.TopicResponseDTO;
import com.tmb.csnerd.demo.dto.topic.UpdateTopicDTO;
import com.tmb.csnerd.demo.exceptions.ConflictStatusException;
import com.tmb.csnerd.demo.exceptions.category.CategoryNotFoundException;
import com.tmb.csnerd.demo.exceptions.topic.TopicNotFoundException;
import com.tmb.csnerd.demo.domain.models.Topic;
import com.tmb.csnerd.demo.domain.repositories.PostRepository;
import com.tmb.csnerd.demo.domain.repositories.TopicRepository;
import com.tmb.csnerd.demo.domain.repositories.UserRepository;
import com.tmb.csnerd.demo.utils.SlugifyUtils;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.parameters.P;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class TopicCommandService {
    private final TopicRepository topicRepository;
    private final PostRepository postRepository;
    private final CategoryQueryService categoryQueryService;

    @Transactional
    public TopicResponseDTO createTopic(CreateTopicDTO request) {
        Category category = categoryQueryService.getCategoryById(request.categoryId()).orElseThrow(() -> new CategoryNotFoundException(request.categoryId()));
        Topic topic = new Topic();
        topic.setName(request.name());
        topic.setSlugName(SlugifyUtils.slugify(request.name()));
        topic.setDescription(request.description());
        topic.setCategory(category);
        return convertToTopicResponseDTO(topicRepository.save(topic));
    }

    @Transactional
    public TopicResponseDTO patchTopic(Long topicId, UpdateTopicDTO request) {
        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new TopicNotFoundException(topicId));
        modifyTopicIfChanged(topic, request.name(), request.description(), request.categoryId());
        return convertToTopicResponseDTO(topicRepository.save(topic));
    }

    @Transactional
    public TopicResponseDTO putTopic(Long topicId, ReplaceTopicDTO request) {
        Topic topic = topicRepository.findById(topicId)
                .orElse(null);
        if (topic == null) {
            topic = new Topic();
        }
        modifyTopicIfChanged(topic, request.name(), request.description(), request.categoryId());
        return convertToTopicResponseDTO(topicRepository.save(topic));
    }

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
        if (topic.getCategory() == null) {
            Category category = categoryQueryService.getCategoryById(newCategoryId).orElseThrow(() -> new CategoryNotFoundException(newCategoryId));
            topic.setCategory(category);
        }
        else if (!topic.getCategory().getId().equals(newCategoryId)) {
            categoryQueryService.getCategoryById(newCategoryId).ifPresent(topic::setCategory);
        }
    }

    TopicResponseDTO convertToTopicResponseDTO(Topic topic) {
        return new TopicResponseDTO(topic.getId(), topic.getName(), topic.getSlugName(), topic.getDescription(), topic.getCategory().getId(), topic.getCategory().getName());
    }
}
