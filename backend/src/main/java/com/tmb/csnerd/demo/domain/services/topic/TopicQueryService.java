package com.tmb.csnerd.demo.domain.services.topic;

import com.tmb.csnerd.demo.domain.models.Topic;
import com.tmb.csnerd.demo.domain.repositories.topic.TopicRepository;
import com.tmb.csnerd.demo.domain.security.UserPrincipal;
import com.tmb.csnerd.demo.domain.services.auth.UserPrincipalService;
import com.tmb.csnerd.demo.dto.common.CachedContent;
import com.tmb.csnerd.demo.dto.common.ETagResponse;
import com.tmb.csnerd.demo.dto.topic.adminresponse.TopicAdminDetailDTO;
import com.tmb.csnerd.demo.dto.topic.publicresponse.TopicPersonalDetailDTO;
import com.tmb.csnerd.demo.dto.topic.publicresponse.TopicPublicDetailDTO;
import com.tmb.csnerd.demo.exceptions.UnauthorizedException;
import com.tmb.csnerd.demo.exceptions.topic.TopicByIdNotFoundException;
import com.tmb.csnerd.demo.domain.services.cache.ETagFactory;
import com.tmb.csnerd.demo.exceptions.topic.TopicByPublicUriNotFoundException;
import com.tmb.csnerd.demo.utils.PageableUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import java.util.*;

@RequiredArgsConstructor
@Service
public class TopicQueryService {
    private final TopicRepository topicRepository;
    private final TopicCacheableService topicCacheableService;
    private final PageableUtils pageableUtils;
    private final ETagFactory eTagFactory;
    private final UserPrincipalService userPrincipalService;
    private final TopicContentLoader topicContentLoader;

    public Topic getTopicById(Long id) {
        return topicRepository.getTopicById(id).orElseThrow(() ->  new TopicByIdNotFoundException(id));
    }

    public Topic getActiveTopicByPublicUri(String publicUri) {
        return topicRepository.getActiveTopicByPublicUri(publicUri).orElseThrow(() ->  new TopicByPublicUriNotFoundException(publicUri));
    }

    public ETagResponse<Page<TopicAdminDetailDTO>> getTopicsForAdmin(Pageable pageable) {
        Page<Long> ids = topicRepository.getIdsInPage(pageable);
        List<String> componentsForETag = pageableUtils.getRepresentationForPage("admin-topic-page:v1", pageable, ids);
        if (ids.isEmpty()) {
            String eTag = eTagFactory.weakETag(componentsForETag.toArray(String[]::new));
            return ETagResponse.from(new PageImpl<>(Collections.emptyList(), pageable, 0), eTag);
        }
        Map<Long, CachedContent<TopicAdminDetailDTO>> contents = topicCacheableService.getTopicsForAdminByIds(ids.getContent());
        List<TopicAdminDetailDTO> result = new ArrayList<>();
        for (Long id : ids.getContent()) {
            CachedContent<TopicAdminDetailDTO> content = contents.get(id);
            result.add(content.content());
            // ETag computation
            componentsForETag.add("id:" + id);
            componentsForETag.add("content:" + content.fingerprint());
        }
        String eTag = eTagFactory.weakETag(componentsForETag.toArray(String[]::new));
        return ETagResponse.from(new PageImpl<>(result, pageable, ids.getTotalElements()), eTag);
    }

    public ETagResponse<Slice<TopicPublicDetailDTO>> getTopicsForPublic(String categorySlug, Pageable pageable) {
        Slice<Long> ids = topicRepository.getIdsForPublicInSlice(categorySlug, pageable);
        List<String> componentsForETag = pageableUtils.getRepresentationForSlice("public-topic-page:v1", pageable, ids);
        if (ids.isEmpty()) {
            String eTag = eTagFactory.weakETag(componentsForETag.toArray(String[]::new));
            return ETagResponse.from(new PageImpl<>(Collections.emptyList(), pageable, 0), eTag);
        }
        Map<Long, CachedContent<TopicPublicDetailDTO>> contents = topicCacheableService.getTopicsForPublicByIds(ids.getContent());
        List<TopicPublicDetailDTO> result = new ArrayList<>();
        for (Long id : ids.getContent()) {
            CachedContent<TopicPublicDetailDTO> content = contents.get(id);
            result.add(content.content());
            // ETag computation
            componentsForETag.add("id:" + id);
            componentsForETag.add("content:" + content.fingerprint());
        }
        String eTag = eTagFactory.weakETag(componentsForETag.toArray(String[]::new));
        return ETagResponse.from(new SliceImpl<>(result, pageable, ids.hasNext()), eTag);
    }

    public ETagResponse<Slice<TopicPersonalDetailDTO>> getTopicsForProfile(Jwt jwt, Pageable pageable) {
        UserPrincipal userPrincipal = userPrincipalService.convertJwtToUserPrincipal(jwt);
        requireAuthenticated(userPrincipal);
        Slice<Long> ids = topicRepository.getIdsForProfileInSlice(userPrincipal.getUser().getId(), pageable);
        List<String> componentsForETag = pageableUtils.getRepresentationForSlice("profile-topic-page:v1", pageable, ids);
        componentsForETag.add("user:" + userPrincipal.getUser().getId());
        if (ids.isEmpty()) {
            String eTag = eTagFactory.weakETag(componentsForETag.toArray(String[]::new));
            return ETagResponse.from(new PageImpl<>(Collections.emptyList(), pageable, 0), eTag);
        }
        Map<Long, CachedContent<TopicPersonalDetailDTO>> contents = topicContentLoader.loadAllTopicsForProfileByIds(Set.copyOf(ids.getContent()));
        List<TopicPersonalDetailDTO> result = new ArrayList<>();
        for (Long id : ids.getContent()) {
            CachedContent<TopicPersonalDetailDTO> content = contents.get(id);
            result.add(content.content());
            // ETag computation
            componentsForETag.add("id:" + id);
            componentsForETag.add("content:" + content.fingerprint());
        }
        String eTag = eTagFactory.weakETag(componentsForETag.toArray(String[]::new));
        return ETagResponse.from(new SliceImpl<>(result, pageable, ids.hasNext()), eTag);
    }

    private void requireAuthenticated(UserPrincipal principal) {
        if (principal == null) throw new UnauthorizedException(HttpStatus.UNAUTHORIZED);
    }
}
