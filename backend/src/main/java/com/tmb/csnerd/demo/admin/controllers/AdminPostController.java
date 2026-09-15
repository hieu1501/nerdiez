package com.tmb.csnerd.demo.admin.controllers;

import com.tmb.csnerd.demo.domain.security.UserPrincipal;
import com.tmb.csnerd.demo.domain.services.auth.UserPrincipalService;
import com.tmb.csnerd.demo.domain.services.post.PostCommandService;
import com.tmb.csnerd.demo.domain.services.post.PostQueryService;
import com.tmb.csnerd.demo.dto.common.ETagResponse;
import com.tmb.csnerd.demo.dto.common.PageResponse;
import com.tmb.csnerd.demo.dto.post.adminresponse.AdminPostBriefDTO;
import com.tmb.csnerd.demo.dto.post.adminresponse.AdminPostDetailDTO;
import com.tmb.csnerd.demo.dto.post.request.AdminCreatePostRequestDTO;
import com.tmb.csnerd.demo.dto.post.request.AdminPatchPostRequestDTO;
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

import java.net.URI;
import java.net.URISyntaxException;
import java.util.Set;

@RestController
@RequestMapping("admin/api/articles")
@RequiredArgsConstructor
public class AdminPostController {
    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of("createdAt", "updatedAt", "title");

    private final PostCommandService postCommandService;
    private final PostQueryService postQueryService;
    private final UserPrincipalService userPrincipalService;
    private final PageableUtils pageableUtils;

    @GetMapping(
        produces = { MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE }
    )
    public ResponseEntity<PageResponse<AdminPostBriefDTO>> getAllAdminPostItems(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            WebRequest request) {
        Pageable safePageable = PageRequest.of(
                pageableUtils.getSafePageNumber(pageable.getPageNumber()),
                pageableUtils.getSafePageSize(pageable.getPageSize(), 100),
                pageableUtils.getSafeSort(pageable.getSort(), ALLOWED_SORT_FIELDS, "id")
        );
        ETagResponse<Page<AdminPostBriefDTO>> allPostsPage = postQueryService.getPostsForAdmin(safePageable);
        String eTag = allPostsPage.eTag();
        if (request.checkNotModified(eTag)) {
            return null;
        }
        return ResponseEntity.ok()
                .header(HttpHeaders.VARY, "Accept-Encoding", "User-Agent")
                .cacheControl(CacheControl.noCache())
                .eTag(eTag)
                .body(PageResponse.from(allPostsPage.content()));
    }

    @GetMapping(
        path = "/{id}",
        produces = { MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE }
    )
    public ResponseEntity<AdminPostDetailDTO> getPostItemForAdmin(@PathVariable Long id, WebRequest request) {
        ETagResponse<AdminPostDetailDTO> postDetail = postQueryService.findAdminPostById(id);
        String eTag = postDetail.eTag();
        if (request.checkNotModified(eTag)) {
            return null;
        }
        return ResponseEntity.ok()
                .header(HttpHeaders.VARY, "Accept-Encoding", "User-Agent")
                .cacheControl(CacheControl.noCache())
                .eTag(eTag)
                .body(postDetail.content());
    }

    @PostMapping(
        consumes = MediaType.APPLICATION_JSON_VALUE,
        produces = { MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE }
    )
    public ResponseEntity<AdminPostDetailDTO> addPost(@Valid @RequestBody AdminCreatePostRequestDTO request, @AuthenticationPrincipal Jwt jwt) throws URISyntaxException {
        UserPrincipal userPrincipal = userPrincipalService.convertJwtToUserPrincipal(jwt);
        AdminPostDetailDTO post = postCommandService.createPostForAdmin(request, userPrincipal);
        URI postLocation = new URI("admin/api/articles/" + post.content().id());
        return ResponseEntity.created(postLocation).body(post);
    }

    @PatchMapping(
        path ="/{id}",
        consumes = MediaType.APPLICATION_JSON_VALUE,
        produces = { MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE }
    )
    public ResponseEntity<AdminPostDetailDTO> patchPost(@PathVariable Long id, @Valid @RequestBody AdminPatchPostRequestDTO request, @AuthenticationPrincipal Jwt jwt) {
        UserPrincipal userPrincipal = userPrincipalService.convertJwtToUserPrincipal(jwt);
        AdminPostDetailDTO post = postCommandService.patchPostById(id, request, userPrincipal);
        return ResponseEntity.ok(post);
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        UserPrincipal userPrincipal = userPrincipalService.convertJwtToUserPrincipal(jwt);
        postCommandService.hardDeletePostById(id, userPrincipal);
        return ResponseEntity.noContent().build();
    }
}
