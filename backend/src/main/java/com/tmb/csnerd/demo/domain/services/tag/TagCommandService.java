package com.tmb.csnerd.demo.domain.services.tag;

import com.tmb.csnerd.demo.domain.cache.post.PostListChangedEvent;
import com.tmb.csnerd.demo.domain.cache.tag.TagChangedEvent;
import com.tmb.csnerd.demo.domain.models.Tag;
import com.tmb.csnerd.demo.domain.repositories.tag.TagRepository;
import com.tmb.csnerd.demo.domain.repositories.tag.projections.TagUseCountProjection;
import com.tmb.csnerd.demo.domain.services.post.PostQueryService;
import com.tmb.csnerd.demo.dto.tag.adminresponse.TagAdminDetailDTO;
import com.tmb.csnerd.demo.dto.tag.request.CreateTagRequestDTO;
import com.tmb.csnerd.demo.dto.tag.request.UpdateTagRequestDTO;
import com.tmb.csnerd.demo.exceptions.ConflictStatusException;
import com.tmb.csnerd.demo.exceptions.tag.TagNotFoundException;
import com.tmb.csnerd.demo.utils.SlugifyUtils;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;

@RequiredArgsConstructor
@Service
public class TagCommandService {
    private final TagRepository tagRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final PostQueryService postQueryService;

    @Transactional
    public TagAdminDetailDTO createTag(CreateTagRequestDTO request) {
        Tag tag = new Tag();
        tag.setSlug(SlugifyUtils.slugify(request.name()));
        if (request.isActive() != null) tag.setIsActive(request.isActive());
        tag = tagRepository.save(tag);
        eventPublisher.publishEvent(new TagChangedEvent());
        return TagAdminDetailDTO.from(tag, 0L, 0L); // Newly created tags do not have any usages
    }

    @Transactional
    public TagAdminDetailDTO patchTag(Long tagId, UpdateTagRequestDTO request) {
        Tag tag = tagRepository.findById(tagId)
                .orElseThrow(() -> new TagNotFoundException(tagId));
        modifyTagIfChanged(tag, request.name(), request.isActive());
        tag = tagRepository.save(tag);
        TagUseCountProjection useCount = tagRepository.getUseCountByTagId(tagId).orElseThrow(() -> new TagNotFoundException(tagId));
        List<Long> modifiedPostIds = postQueryService.getPostIdsByTagId(tagId);
        if (!modifiedPostIds.isEmpty()) {
            Set<Long> stalePostIds = Set.copyOf(modifiedPostIds);
            eventPublisher.publishEvent(new PostListChangedEvent(stalePostIds));
        }
        eventPublisher.publishEvent(new TagChangedEvent());
        return TagAdminDetailDTO.from(tag, useCount.postUseCount(), useCount.topicUseCount());
    }

    @Transactional
    public void deleteTag(Long tagId) {
        Tag tag = tagRepository.findById(tagId)
            .orElseThrow(() -> new TagNotFoundException(tagId));
        if (postQueryService.existsActiveByTagId(tagId)) {
            throw new ConflictStatusException("Tag is used by active posts");
        }
        tagRepository.delete(tag);
        eventPublisher.publishEvent(new TagChangedEvent());
    }

    private void modifyTagIfChanged(Tag tag, String newSlugName, Boolean newIsActive) {
        if (newSlugName != null && !newSlugName.isBlank()) {
            String normalizedSlugName = SlugifyUtils.slugify(newSlugName);
            if (!normalizedSlugName.equals(tag.getSlug())) {
                tag.setSlug(normalizedSlugName);
            }
        }
        if (newIsActive != null && !newIsActive.equals(tag.getIsActive())) {
            tag.setIsActive(newIsActive);
        }
    }
}
