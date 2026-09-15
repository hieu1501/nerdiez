package com.tmb.csnerd.demo.admin.controllers;

import com.tmb.csnerd.demo.domain.security.UserPrincipal;
import com.tmb.csnerd.demo.domain.services.auth.UserPrincipalService;
import com.tmb.csnerd.demo.domain.services.topic.TopicCommandService;
import com.tmb.csnerd.demo.domain.services.topic.TopicQueryService;
import com.tmb.csnerd.demo.dto.common.ETagResponse;
import com.tmb.csnerd.demo.dto.common.PageResponse;
import com.tmb.csnerd.demo.dto.topic.adminresponse.TopicAdminDetailDTO;
import com.tmb.csnerd.demo.dto.topic.request.AdminCreateTopicRequestDTO;
import com.tmb.csnerd.demo.dto.topic.request.AdminPatchTopicRequestDTO;
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
import org.springframework.web.bind.annotation.*;
import org.springframework.web.context.request.WebRequest;

import java.util.Set;

@RestController
@RequiredArgsConstructor
@RequestMapping("admin/api/topics")
public class AdminTopicController {
    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of("slug", "category.slugName");

    private final TopicCommandService topicCommandService;
    private final TopicQueryService topicQueryService;
    private final PageableUtils pageableUtils;
    private final UserPrincipalService userPrincipalService;

    @GetMapping(
        produces = { MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE }
    )
    public ResponseEntity<PageResponse<TopicAdminDetailDTO>> getAllTopicsForAdmin(@PageableDefault(size = 20, sort = "slug", direction = Sort.Direction.ASC) Pageable pageable, WebRequest request) {
        Pageable safePageable = PageRequest.of(
                pageableUtils.getSafePageNumber(pageable.getPageNumber()),
                pageableUtils.getSafePageSize(pageable.getPageSize(), 100),
                pageableUtils.getSafeSort(pageable.getSort(), ALLOWED_SORT_FIELDS, "id")
        );
        ETagResponse<Page<TopicAdminDetailDTO>> allTopicsPage = topicQueryService.getTopicsForAdmin(safePageable);
        String eTag = allTopicsPage.eTag();
        if (request.checkNotModified(eTag)) {
            return null;
        }
        return ResponseEntity.ok()
                .header(HttpHeaders.VARY, "Accept-Encoding", "User-Agent")
                .cacheControl(CacheControl.noCache())
                .eTag(eTag)
                .body(PageResponse.from(allTopicsPage.content()));
    }

    @PostMapping(
        consumes = MediaType.APPLICATION_JSON_VALUE,
        produces = { MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE }
    )
    public ResponseEntity<TopicAdminDetailDTO> createTopic(@Valid @RequestBody AdminCreateTopicRequestDTO request, @AuthenticationPrincipal Jwt jwt) {
        UserPrincipal userPrincipal = userPrincipalService.convertJwtToUserPrincipal(jwt);
        TopicAdminDetailDTO topic = topicCommandService.createTopicForAdmin(request, userPrincipal);
        return ResponseEntity.ok(topic);
    }

    @PatchMapping(
        path = "/{id}",
        consumes = MediaType.APPLICATION_JSON_VALUE,
        produces = { MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE }
    )
    public ResponseEntity<TopicAdminDetailDTO> patchTopic(@PathVariable Long id, @Valid @RequestBody AdminPatchTopicRequestDTO request, @AuthenticationPrincipal Jwt jwt) {
        UserPrincipal userPrincipal = userPrincipalService.convertJwtToUserPrincipal(jwt);
        TopicAdminDetailDTO topic = topicCommandService.patchTopicById(id, request, userPrincipal);
        return ResponseEntity.ok(topic);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTopic(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        UserPrincipal userPrincipal = userPrincipalService.convertJwtToUserPrincipal(jwt);
        topicCommandService.hardDeleteTopic(id, userPrincipal);
        return ResponseEntity.noContent().build();
    }
}
