package com.tmb.csnerd.demo.domain.services.topic;

import com.tmb.csnerd.demo.domain.cache.tag.TagDetailsForAdminChangedEvent;
import com.tmb.csnerd.demo.domain.cache.topic.TopicChangedEvent;
import com.tmb.csnerd.demo.domain.models.Category;
import com.tmb.csnerd.demo.domain.models.Tag;
import com.tmb.csnerd.demo.domain.models.Topic;
import com.tmb.csnerd.demo.domain.models.User;
import com.tmb.csnerd.demo.domain.repositories.topic.TopicRepository;
import com.tmb.csnerd.demo.domain.security.UserPrincipal;
import com.tmb.csnerd.demo.domain.services.category.CategoryQueryService;
import com.tmb.csnerd.demo.domain.services.publicuri.PublicResourceUriFactory;
import com.tmb.csnerd.demo.domain.services.tag.TagQueryService;
import com.tmb.csnerd.demo.dto.topic.request.AdminCreateTopicRequestDTO;
import com.tmb.csnerd.demo.dto.topic.request.AdminPatchTopicRequestDTO;
import com.tmb.csnerd.demo.dto.topic.request.PublicCreateTopicRequestDTO;
import com.tmb.csnerd.demo.dto.topic.request.PublicPatchTopicRequestDTO;
import com.tmb.csnerd.demo.exceptions.UnauthorizedException;
import com.tmb.csnerd.demo.exceptions.topic.TopicByIdNotFoundException;
import com.tmb.csnerd.demo.utils.SlugifyUtils;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

@RequiredArgsConstructor
@Service
public class TopicTransactionalService {
    private final TopicRepository topicRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final TagQueryService tagQueryService;
    private final CategoryQueryService categoryQueryService;
    private final PublicResourceUriFactory publicResourceUriFactory;

    @Transactional
    public Topic draftTopicTransactional(PublicCreateTopicRequestDTO request, String publicKey, UserPrincipal userPrincipal) {
        requireAuthenticated(userPrincipal);
        Category category = categoryQueryService.getActiveCategoryBySlug(request.categorySlug());
        Set<Tag> requestedTags = request.tagSlugs().isEmpty() ? Set.of() : tagQueryService.getActiveTagsBySlugNames(request.tagSlugs());
        Topic created = createTopic(request.name(), request.description(), category, requestedTags, publicKey, userPrincipal.getUser());
        created.setIsActive(false);
        Topic saved = topicRepository.saveAndFlush(created);
        eventPublisher.publishEvent(new TopicChangedEvent());
        return saved;
    }

    @Transactional
    public Topic createTopicTransactional(AdminCreateTopicRequestDTO request, String publicKey, UserPrincipal userPrincipal) {
        requireAuthenticated(userPrincipal);
        Category category = categoryQueryService.getCategoryById(request.categoryId());
        Set<Tag> requestedTags = request.tagIds().isEmpty() ? Set.of() : tagQueryService.getTagsByIds(request.tagIds());
        Topic created = createTopic(request.name(), request.description(), category, requestedTags, publicKey, userPrincipal.getUser());
        created.setIsActive(Boolean.TRUE.equals(request.isActive()));
        Topic saved = topicRepository.saveAndFlush(created);
        eventPublisher.publishEvent(new TopicChangedEvent());
        return saved;
    }

    private Topic createTopic(String name, String description, Category category, Set<Tag> tags, String publicKey, User author) {
        String slug = createSlug(name);
        String publicUri = publicResourceUriFactory.createPublicUri(slug, publicKey);
        Topic topic = new Topic();
        topic.setPublicUri(publicUri);
        topic.setName(name);
        topic.setSlug(createSlug(name));
        topic.setDescription(description);
        topic.setCategory(category);
        topic.setAuthor(author);
        updateTagsForTopic(topic, tags);
        return topic;
    }

    @Transactional
    public Topic patchTopicForAdminTransactional(Long topicId, AdminPatchTopicRequestDTO request, UserPrincipal userPrincipal) {
        requireAuthenticated(userPrincipal);
        Topic topic = topicRepository.getTopicById(topicId).orElseThrow(() -> new TopicByIdNotFoundException(topicId));
        requireOwnerOrAdmin(topic.getAuthor(), userPrincipal);
        Topic changed = patchTopic(topic, request.name(), request.name());
        changed.setIsActive(Boolean.TRUE.equals(request.isActive()));
        if (request.tagIds() != null && !request.tagIds().isEmpty()) {
            Set<Tag> requestedTags = tagQueryService.getTagsByIds(request.tagIds());
            updateTagsForTopic(topic, requestedTags);
        }
        Topic saved = topicRepository.save(changed);
        eventPublisher.publishEvent(new TopicChangedEvent());
        return saved;
    }

    @Transactional
    public Topic patchTopicForPublicTransactional(Long topicId, PublicPatchTopicRequestDTO request, UserPrincipal userPrincipal) {
        requireAuthenticated(userPrincipal);
        Topic topic = topicRepository.getTopicById(topicId).orElseThrow(() -> new TopicByIdNotFoundException(topicId));
        requireOwnerOrAdmin(topic.getAuthor(), userPrincipal);
        Topic changed = patchTopic(topic, request.name(), request.name());
        if (request.tagSlugs() != null && !request.tagSlugs().isEmpty()) {
            Set<Tag> requestedTags = tagQueryService.getActiveTagsBySlugNames(request.tagSlugs());
            updateTagsForTopic(topic, requestedTags);
        }
        Topic saved = topicRepository.save(changed);
        eventPublisher.publishEvent(new TopicChangedEvent());
        return saved;
    }

    private Topic patchTopic(Topic topic, String name, String description) {
        if (topic.getName() == null || (!name.isBlank() && !topic.getName().equals(name))) {
            topic.setName(name);
            topic.setSlug(createSlug(name));
        }
        if (topic.getDescription() == null || (!description.isBlank() && !topic.getDescription().equals(description))) {
            topic.setDescription(description);
        }
        return topic;
    }

    @Transactional
    public void softDeleteTopicTransactional(Long topicId, UserPrincipal userPrincipal) {
        requireAuthenticated(userPrincipal);
        Topic topic = topicRepository.findById(topicId).orElseThrow(() -> new TopicByIdNotFoundException(topicId));
        requireOwnerOrAdmin(topic.getAuthor(), userPrincipal);
        topic.setIsActive(false);
        topicRepository.save(topic);
        eventPublisher.publishEvent(new TopicChangedEvent());
    }

    @Transactional
    public void hardDeleteTopicTransactional(Long topicId, UserPrincipal userPrincipal) {
        requireAuthenticated(userPrincipal);
        Topic topic = topicRepository.findById(topicId).orElseThrow(() -> new TopicByIdNotFoundException(topicId));
        requireOwnerOrAdmin(topic.getAuthor(), userPrincipal);
        topicRepository.delete(topic);
        eventPublisher.publishEvent(new TopicChangedEvent());
    }

    private String createSlug(String title) {
        return SlugifyUtils.slugify(title);
    }

    private void updateTagsForTopic(Topic topic, Set<Tag> requestedTags) {
        if (requestedTags == null || requestedTags.isEmpty()) return;
        Set<Tag> currentTags = topic.getTags();
        if (currentTags == null) {
            currentTags = new HashSet<>();
            topic.setTags(currentTags);
        }
        Set<Tag> tagsToAdd = new HashSet<>(requestedTags);
        tagsToAdd.removeAll(currentTags);
        currentTags.removeIf(tag -> !requestedTags.contains(tag));
        currentTags.addAll(tagsToAdd);
        eventPublisher.publishEvent(new TagDetailsForAdminChangedEvent());
    }

    private void requireAuthenticated(UserPrincipal principal) {
        if (principal == null) throw new UnauthorizedException(HttpStatus.UNAUTHORIZED);
    }

    private void requireOwnerOrAdmin(User author, UserPrincipal principal) {
        if (!principal.isAdmin() && !Objects.equals(author.getId(), principal.getUser().getId())) {
            throw new UnauthorizedException(HttpStatus.FORBIDDEN);
        }
    }
}
