package com.tmb.csnerd.demo.public_api.controllers;

import com.tmb.csnerd.demo.domain.services.topic.TopicQueryService;
import com.tmb.csnerd.demo.dto.common.ETagResponse;
import com.tmb.csnerd.demo.dto.common.PageResponse;
import com.tmb.csnerd.demo.dto.common.SliceResponse;
import com.tmb.csnerd.demo.dto.topic.adminresponse.TopicAdminDetailDTO;
import com.tmb.csnerd.demo.dto.topic.publicresponse.TopicPersonalDetailDTO;
import com.tmb.csnerd.demo.dto.topic.publicresponse.TopicPublicDetailDTO;
import com.tmb.csnerd.demo.utils.PageableUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.context.request.WebRequest;

import java.util.Set;

@RestController
@RequiredArgsConstructor
@RequestMapping()
public class TopicController {
    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of("slug", "category.slugName");

    private final TopicQueryService topicQueryService;
    private final PageableUtils pageableUtils;

    @GetMapping(
        path = "api/categories/{categorySlug}/topics",
        produces = { MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE }
    )
    public ResponseEntity<SliceResponse<TopicPublicDetailDTO>> getAllTopicsForPublic(
            @PathVariable String categorySlug,
            @PageableDefault(size = 10, sort = "slug", direction = Sort.Direction.ASC) Pageable pageable,
            WebRequest request) {
        Pageable safePageable = PageRequest.of(
                pageableUtils.getSafePageNumber(pageable.getPageNumber()),
                pageableUtils.getSafePageSize(pageable.getPageSize(), 100),
                pageableUtils.getSafeSort(pageable.getSort(), ALLOWED_SORT_FIELDS, "id")
        );
        ETagResponse<Slice<TopicPublicDetailDTO>> allTopicsPage = topicQueryService.getTopicsForPublic(categorySlug, safePageable);
        String eTag = allTopicsPage.eTag();
        if (request.checkNotModified(eTag)) {
            return null;
        }
        return ResponseEntity.ok()
                .header(HttpHeaders.VARY, "Accept-Encoding", "User-Agent")
                .cacheControl(CacheControl.noCache())
                .eTag(eTag)
                .body(SliceResponse.from(allTopicsPage.content()));
    }

    @GetMapping(
        path = "api/me/topics",
        produces = { MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE }
    )
    public ResponseEntity<SliceResponse<TopicPersonalDetailDTO>> getAllTopicsForProfile(
            @PageableDefault(size = 10, sort = "slug", direction = Sort.Direction.ASC) Pageable pageable,
            @AuthenticationPrincipal Jwt jwt,
            WebRequest request) {
        Pageable safePageable = PageRequest.of(
                pageableUtils.getSafePageNumber(pageable.getPageNumber()),
                pageableUtils.getSafePageSize(pageable.getPageSize(), 100),
                pageableUtils.getSafeSort(pageable.getSort(), ALLOWED_SORT_FIELDS, "id")
        );
        ETagResponse<Slice<TopicPersonalDetailDTO>> allTopicsPage = topicQueryService.getTopicsForProfile(jwt, safePageable);
        String eTag = allTopicsPage.eTag();
        if (request.checkNotModified(eTag)) {
            return null;
        }
        return ResponseEntity.ok()
                .header(HttpHeaders.VARY, "Accept-Encoding", "User-Agent")
                .cacheControl(CacheControl.noCache())
                .eTag(eTag)
                .body(SliceResponse.from(allTopicsPage.content()));
    }
}
