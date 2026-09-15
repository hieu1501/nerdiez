package com.tmb.csnerd.demo.public_api.controllers;

import com.tmb.csnerd.demo.domain.security.UserPrincipal;
import com.tmb.csnerd.demo.domain.services.auth.UserPrincipalService;
import com.tmb.csnerd.demo.domain.services.talk.TalkQueryService;
import com.tmb.csnerd.demo.dto.common.ETagResponse;
import com.tmb.csnerd.demo.dto.common.SliceResponse;
import com.tmb.csnerd.demo.dto.talk.publicresponse.PersonalTalkContentDTO;
import com.tmb.csnerd.demo.dto.talk.publicresponse.PublicTalkDTO;
import com.tmb.csnerd.demo.utils.PageableUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.context.request.WebRequest;

import java.util.Set;

@RestController
@RequiredArgsConstructor
public class TalkController {
    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of("createdAt", "updatedAt");

    private final TalkQueryService queryService;
    private final UserPrincipalService userPrincipalService;
    private final PageableUtils pageableUtils;

    @GetMapping(
        path = "/api/topics/{topicPublicUri}/talks",
        produces = { MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE }
    )
    public ResponseEntity<SliceResponse<PublicTalkDTO>> getTalksByTopicUri(
            @PathVariable String topicPublicUri,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            @AuthenticationPrincipal Jwt jwt,
            WebRequest request
    ) {
        Pageable safePageable = PageRequest.of(
                pageableUtils.getSafePageNumber(pageable.getPageNumber()),
                pageableUtils.getSafePageSize(pageable.getPageSize(), 30),
                pageableUtils.getSafeSort(pageable.getSort(), ALLOWED_SORT_FIELDS, "id")
        );
        UserPrincipal userPrincipal = userPrincipalService.convertJwtToUserPrincipal(jwt);
        ETagResponse<Slice<PublicTalkDTO>> response = queryService.getTalksSliceByTopicPublicUri(topicPublicUri, userPrincipal, safePageable);
        if (request.checkNotModified(response.eTag())) return null;
        return ResponseEntity.ok()
            .header(HttpHeaders.VARY, "Accept-Encoding", "User-Agent")
            .cacheControl(CacheControl.noCache())
            .eTag(response.eTag())
            .body(SliceResponse.from(response.content()));
    }

    @GetMapping(
            path = "/api/me/topics/{topicPublicUri}/talks",
            produces = { MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE }
    )
    public ResponseEntity<SliceResponse<PersonalTalkContentDTO>> getTalksByTopicUriForProfile(
            @PathVariable String topicPublicUri,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            @AuthenticationPrincipal Jwt jwt,
            WebRequest request
    ) {
        Pageable safePageable = PageRequest.of(
                pageableUtils.getSafePageNumber(pageable.getPageNumber()),
                pageableUtils.getSafePageSize(pageable.getPageSize(), 30),
                pageableUtils.getSafeSort(pageable.getSort(), ALLOWED_SORT_FIELDS, "id")
        );
        UserPrincipal userPrincipal = userPrincipalService.convertJwtToUserPrincipal(jwt);
        ETagResponse<Slice<PersonalTalkContentDTO>> response = queryService.getTalksSliceForProfile(topicPublicUri, userPrincipal, safePageable);
        if (request.checkNotModified(response.eTag())) return null;
        return ResponseEntity.ok()
                .header(HttpHeaders.VARY, "Accept-Encoding", "User-Agent")
                .cacheControl(CacheControl.noCache())
                .eTag(response.eTag())
                .body(SliceResponse.from(response.content()));
    }
}
