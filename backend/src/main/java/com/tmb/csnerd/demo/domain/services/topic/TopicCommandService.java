package com.tmb.csnerd.demo.domain.services.topic;
import com.tmb.csnerd.demo.domain.models.Topic;
import com.tmb.csnerd.demo.domain.repositories.topic.TopicRepository;
import com.tmb.csnerd.demo.domain.security.UserPrincipal;
import com.tmb.csnerd.demo.domain.services.publicuri.PublicKeyGenerator;
import com.tmb.csnerd.demo.domain.services.publicuri.PublicResourceUriFactory;
import com.tmb.csnerd.demo.dto.topic.adminresponse.TopicAdminDetailDTO;
import com.tmb.csnerd.demo.dto.topic.publicresponse.TopicPersonalDetailDTO;
import com.tmb.csnerd.demo.dto.topic.request.AdminCreateTopicRequestDTO;
import com.tmb.csnerd.demo.dto.topic.request.AdminPatchTopicRequestDTO;
import com.tmb.csnerd.demo.dto.topic.request.PublicCreateTopicRequestDTO;
import com.tmb.csnerd.demo.dto.topic.request.PublicPatchTopicRequestDTO;
import com.tmb.csnerd.demo.exceptions.topic.TopicByPublicUriNotFoundException;
import lombok.RequiredArgsConstructor;
import org.hibernate.exception.ConstraintViolationException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import java.net.URI;

@RequiredArgsConstructor
@Service
public class TopicCommandService {
    private static final int MAX_PUBLIC_URI_ATTEMPTS = 3;

    private final PublicKeyGenerator publicKeyGenerator;
    private final TopicTransactionalService topicTransactionalService;
    private final PublicResourceUriFactory publicResourceUriFactory;
    private final TopicRepository topicRepository;

    public TopicAdminDetailDTO createTopicForAdmin(AdminCreateTopicRequestDTO request, UserPrincipal userPrincipal) {
        Topic topic = createTopic(request, userPrincipal);
        URI canonicalUri = publicResourceUriFactory.topic(topic.getPublicUri(), false);
        return TopicAdminDetailDTO.from(topic, canonicalUri);
    }

    public TopicPersonalDetailDTO createTopicForProfile(PublicCreateTopicRequestDTO request, UserPrincipal userPrincipal) {
        Topic topic = draftTopic(request, userPrincipal);
        URI canonicalUri = publicResourceUriFactory.topic(topic.getPublicUri(), true);
        return TopicPersonalDetailDTO.from(topic, canonicalUri);
    }

    public TopicAdminDetailDTO patchTopicById(Long id, AdminPatchTopicRequestDTO request, UserPrincipal userPrincipal) {
        Topic topic = topicTransactionalService.patchTopicForAdminTransactional(id, request, userPrincipal);
        URI publicUri = publicResourceUriFactory.topic(topic.getPublicUri(), false);
        return TopicAdminDetailDTO.from(topic, publicUri);
    }

    public TopicPersonalDetailDTO patchTopicByPublicUri(String publicUri, PublicPatchTopicRequestDTO request, UserPrincipal userPrincipal) {
        Long id = topicRepository.getActiveTopicIdByPublicUri(publicUri).orElseThrow(() -> new TopicByPublicUriNotFoundException(publicUri));
        Topic topic = topicTransactionalService.patchTopicForPublicTransactional(id, request, userPrincipal);
        URI canonicalUri = publicResourceUriFactory.topic(topic.getPublicUri(), true);
        return TopicPersonalDetailDTO.from(topic, canonicalUri);
    }

    public void hardDeleteTopic(Long id, UserPrincipal userPrincipal) {
        topicTransactionalService.hardDeleteTopicTransactional(id, userPrincipal);
    }

    public void hardDeleteTopic(String publicUri, UserPrincipal userPrincipal) {
        Long id = topicRepository.getActiveTopicIdByPublicUri(publicUri).orElseThrow(() -> new TopicByPublicUriNotFoundException(publicUri));
        topicTransactionalService.hardDeleteTopicTransactional(id, userPrincipal);
    }

    private Topic createTopic(AdminCreateTopicRequestDTO request, UserPrincipal userPrincipal) {
        for (int attempt = 0; attempt < MAX_PUBLIC_URI_ATTEMPTS; attempt++) {
            try {
                return topicTransactionalService.createTopicTransactional(request, publicKeyGenerator.generate(), userPrincipal);
            } catch (DataIntegrityViolationException | ConstraintViolationException exception) {
                continue;
            }
        }
        throw new IllegalStateException("Unable to generate a unique Topic public URI");
    }

    private Topic draftTopic(PublicCreateTopicRequestDTO request, UserPrincipal userPrincipal) {
        for (int attempt = 0; attempt < MAX_PUBLIC_URI_ATTEMPTS; attempt++) {
            try {
                return topicTransactionalService.draftTopicTransactional(request, publicKeyGenerator.generate(), userPrincipal);
            } catch (DataIntegrityViolationException | ConstraintViolationException exception) {
                continue;
            }
        }
        throw new IllegalStateException("Unable to generate a unique Topic public URI");
    }
}
