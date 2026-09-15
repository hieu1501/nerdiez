package com.tmb.csnerd.demo.admin.controllers;

import com.tmb.csnerd.demo.domain.security.UserPrincipal;
import com.tmb.csnerd.demo.domain.services.auth.UserPrincipalService;
import com.tmb.csnerd.demo.domain.services.talk.TalkCommandService;
import com.tmb.csnerd.demo.domain.services.talk.TalkQueryService;
import com.tmb.csnerd.demo.dto.common.ETagResponse;
import com.tmb.csnerd.demo.dto.common.PageResponse;
import com.tmb.csnerd.demo.dto.talk.adminresponse.AdminTalkDTO;
import com.tmb.csnerd.demo.dto.talk.request.AdminCreateTalkRequestDTO;
import com.tmb.csnerd.demo.dto.talk.request.AdminPatchTalkRequestDTO;
import com.tmb.csnerd.demo.utils.PageableUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.context.request.WebRequest;

import java.net.URI;
import java.util.Set;

@RestController
@RequiredArgsConstructor
@RequestMapping("/admin/api/talks")
public class AdminTalkController {
    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of("createdAt", "updatedAt");

    private final TalkQueryService talkQueryService;
    private final TalkCommandService talkCommandService;
    private final UserPrincipalService userPrincipalService;
    private final PageableUtils pageableUtils;

    @GetMapping(
        path = "/admin/api/topic/{topicId}/talks",
        produces = { MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE }
    )
    public ResponseEntity<PageResponse<AdminTalkDTO>> getAdminTalksForTopic(
        @PathVariable Long topicId,
        @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
        WebRequest request
    ) {
        Pageable safePageable = PageRequest.of(
            pageableUtils.getSafePageNumber(pageable.getPageNumber()),
            pageableUtils.getSafePageSize(pageable.getPageSize(), 100),
            pageableUtils.getSafeSort(pageable.getSort(), ALLOWED_SORT_FIELDS, "id")
        );
        ETagResponse<Page<AdminTalkDTO>> response = talkQueryService.getTalksForAdmin(topicId, safePageable);
        if (request.checkNotModified(response.eTag())) return null;
        return ResponseEntity.ok()
            .header(HttpHeaders.VARY, "Accept-Encoding", "User-Agent")
            .cacheControl(CacheControl.noCache())
            .eTag(response.eTag())
            .body(PageResponse.from(response.content()));
    }

    @PostMapping(
        path = "/admin/api/talks",
        consumes = MediaType.APPLICATION_JSON_VALUE,
        produces = { MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE }
    )
    public ResponseEntity<AdminTalkDTO> addTalk(@Valid @RequestBody AdminCreateTalkRequestDTO request, @AuthenticationPrincipal Jwt jwt) {
        UserPrincipal userPrincipal = userPrincipalService.convertJwtToUserPrincipal(jwt);
        AdminTalkDTO talk = talkCommandService.createTalkForAdmin(request, userPrincipal);
        return ResponseEntity.created(URI.create("/admin/api/talks/" + talk.content().id()))
                .body(talk);
    }

    @PatchMapping(
        path = "/admin/api/talks/{id}",
        consumes = MediaType.APPLICATION_JSON_VALUE,
        produces = { MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE }
    )
    public ResponseEntity<AdminTalkDTO> patchTalk(@PathVariable Long id, @Valid @RequestBody AdminPatchTalkRequestDTO request, @AuthenticationPrincipal Jwt jwt) {
        UserPrincipal userPrincipal = userPrincipalService.convertJwtToUserPrincipal(jwt);
        AdminTalkDTO talk = talkCommandService.patchTalkById(id, request, userPrincipal);
        return ResponseEntity.ok(talk);
    }

    @DeleteMapping("/admin/api/talks/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        UserPrincipal userPrincipal = userPrincipalService.convertJwtToUserPrincipal(jwt);
        talkCommandService.hardDeleteTalk(id, userPrincipal);
        return ResponseEntity.noContent().build();
    }
}
