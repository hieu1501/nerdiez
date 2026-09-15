package com.tmb.csnerd.demo.domain.services.talk;

import com.tmb.csnerd.demo.domain.cache.talk.TalkChangedEvent;
import com.tmb.csnerd.demo.domain.models.Talk;
import com.tmb.csnerd.demo.domain.models.TalksMetadata;
import com.tmb.csnerd.demo.domain.models.Topic;
import com.tmb.csnerd.demo.domain.models.User;
import com.tmb.csnerd.demo.domain.repositories.talk.TalkRepository;
import com.tmb.csnerd.demo.domain.security.UserPrincipal;
import com.tmb.csnerd.demo.domain.services.image.ImageService;
import com.tmb.csnerd.demo.domain.services.topic.TopicQueryService;
import com.tmb.csnerd.demo.dto.talk.request.AdminCreateTalkRequestDTO;
import com.tmb.csnerd.demo.dto.talk.request.AdminPatchTalkRequestDTO;
import com.tmb.csnerd.demo.dto.talk.request.PublicCreateTalkRequestDTO;
import com.tmb.csnerd.demo.dto.talk.request.PublicPatchTalkRequestDTO;
import com.tmb.csnerd.demo.exceptions.UnauthorizedException;
import com.tmb.csnerd.demo.exceptions.talk.TalkByIdNotFoundException;
import com.tmb.csnerd.demo.utils.MarkdownUtils;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class TalkTransactionalService {
    private final TalkRepository talkRepository;
    private final TopicQueryService topicQueryService;
    private final MarkdownUtils markdownUtils;
    private final ApplicationEventPublisher eventPublisher;
    private final ImageService imageService;

    @Transactional
    public Talk createTalkTransactional(AdminCreateTalkRequestDTO request, UserPrincipal author, String publicKey) {
        requireAuthenticated(author);
        Topic topic = topicQueryService.getTopicById(request.topicId());
        List<String> imagePaths = new ArrayList<>();
        Talk talk = createTalk(topic, author.getUser(), request.content(), request.isActive(), publicKey, imagePaths);

        Talk saved = talkRepository.saveAndFlush(talk);
        imageService.setImagesInUse(Set.copyOf(imagePaths));
        return saved;
    }

    @Transactional
    public Talk createTalkTransactional(PublicCreateTalkRequestDTO request, UserPrincipal author, String publicKey) {
        requireAuthenticated(author);
        Topic topic = topicQueryService.getActiveTopicByPublicUri(request.topicPublicUri());
        List<String> imagePaths = new ArrayList<>();
        Talk talk = createTalk(topic, author.getUser(), request.content(), request.isActive(), publicKey, imagePaths);

        Talk saved = talkRepository.saveAndFlush(talk);
        imageService.setImagesInUse(Set.copyOf(imagePaths));
        return saved;
    }

    private Talk createTalk(Topic topic, User author, String content, Boolean isActive, String publicKey, List<String> imagePaths) {
        Talk talk = new Talk();
        talk.setPublicUri(publicKey);
        talk.setContent(markdownUtils.normalizeMarkdownAndExtractImageUrls(content, imagePaths));
        talk.setAuthor(author);
        talk.setTopic(topic);
        talk.setCreatedAt(Instant.now());
        talk.setUpdatedAt(Instant.now());
        talk.setIsActive(Boolean.TRUE.equals(isActive));
        attachMetadata(talk);
        return talk;
    }

    @Transactional
    public Talk patchTalkTransactional(Long talkId, AdminPatchTalkRequestDTO request, UserPrincipal principal) {
        requireAuthenticated(principal);
        Talk talk = findTalkForModify(talkId);
        requireOwnerOrAdmin(talk.getAuthor(), principal);
        List<String> currentImagePaths = new ArrayList<>();
        List<String> newImagePaths = new ArrayList<>();
        Talk changed = patchTalk(talk, request.content(), request.isActive(), currentImagePaths, newImagePaths);

        Talk saved = talkRepository.save(talk);
        imageService.updateImagesUseCount(Set.copyOf(newImagePaths), Set.copyOf(currentImagePaths));
        eventPublisher.publishEvent(new TalkChangedEvent(talkId));
        return saved;
    }

    @Transactional
    public Talk patchTalkTransactional(Long talkId, PublicPatchTalkRequestDTO request, UserPrincipal principal) {
        requireAuthenticated(principal);
        Talk talk = findTalkForModify(talkId);
        requireOwnerOrAdmin(talk.getAuthor(), principal);
        List<String> currentImagePaths = new ArrayList<>();
        List<String> newImagePaths = new ArrayList<>();
        Talk changed = patchTalk(talk, request.content(), request.isActive(), currentImagePaths, newImagePaths);

        Talk saved = talkRepository.save(talk);
        imageService.updateImagesUseCount(Set.copyOf(newImagePaths), Set.copyOf(currentImagePaths));
        eventPublisher.publishEvent(new TalkChangedEvent(talkId));
        return saved;
    }

    private Talk patchTalk(Talk talk, String content, Boolean isActive, List<String> currentImagePaths, List<String> newImagePaths) {
        // Update content
        if (talk.getContent() != null) {
            currentImagePaths.addAll(markdownUtils.extractImagePathsInContent(talk.getContent()));
        }
        if (content == null) {
            newImagePaths.addAll(currentImagePaths);
        }
        else {
            if (content.isBlank()) {
                throw new IllegalArgumentException("Content must not be blank");
            }
            String normalizedContent = markdownUtils.normalizeMarkdownAndExtractImageUrls(content, newImagePaths);
            talk.setContent(normalizedContent);
        }
        // Update active
        if (isActive != null) {
            talk.setIsActive(isActive);
        }
        talk.setUpdatedAt(Instant.now());
        return talk;
    }


    @Transactional
    public void softDeleteTalkTransactional(Long id, UserPrincipal principal) {
        requireAuthenticated(principal);
        Talk talk = findTalkForModify(id);
        requireOwnerOrAdmin(talk.getAuthor(), principal);
        talk.setIsActive(false);
        talk.setUpdatedAt(Instant.now());
        talkRepository.save(talk);
        eventPublisher.publishEvent(new TalkChangedEvent(id));
    }

    @Transactional
    public void hardDeleteTalkTransactional(Long talkId, UserPrincipal principal) {
        requireAuthenticated(principal);
        Talk talk = findTalkForModify(talkId);
        requireOwnerOrAdmin(talk.getAuthor(), principal);
        if (talk.getContent() != null) {
            List<String> currentImagePaths = new ArrayList<>(markdownUtils.extractImagePathsInContent(talk.getContent()));
            imageService.setImagesNotInUse(Set.copyOf(currentImagePaths));
        }
        talkRepository.delete(talk);
        eventPublisher.publishEvent(new TalkChangedEvent(talkId));
    }

    private Talk findTalkForModify(Long id) {
        return talkRepository.getTalkById(id).orElseThrow(() -> new TalkByIdNotFoundException(id));
    }

    private void attachMetadata(Talk talk) {
        TalksMetadata metadata = new TalksMetadata();
        metadata.setTalk(talk);
        talk.setTalkMetadata(metadata);
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
