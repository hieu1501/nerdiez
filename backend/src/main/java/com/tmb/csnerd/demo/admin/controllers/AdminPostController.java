package com.tmb.csnerd.demo.admin.controllers;

import com.tmb.csnerd.demo.domain.security.UserPrincipal;
import com.tmb.csnerd.demo.domain.services.auth.UserPrincipalService;
import com.tmb.csnerd.demo.domain.services.post.PostCommandService;
import com.tmb.csnerd.demo.domain.services.post.PostQueryService;
import com.tmb.csnerd.demo.dto.common.ETagResponse;
import com.tmb.csnerd.demo.dto.common.PageResponse;
import com.tmb.csnerd.demo.dto.post.adminresponse.AdminPostBriefDTO;
import com.tmb.csnerd.demo.dto.post.adminresponse.AdminPostDetailDTO;
import com.tmb.csnerd.demo.dto.post.request.CreatePostRequestDTO;
import com.tmb.csnerd.demo.dto.post.request.PatchPostRequestDTO;
import com.tmb.csnerd.demo.dto.post.request.PutPostRequestDTO;
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
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("admin/api/articles")
@RequiredArgsConstructor
public class AdminPostController {
    private final PostCommandService postCommandService;
    private final PostQueryService postQueryService;
    private final UserPrincipalService userPrincipalService;
    final Set<String> allowedSortFields = Set.of("createdAt", "updatedAt", "title");

    @GetMapping(
        path = "/all",
        produces = { MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE }
    )
    public ResponseEntity<PageResponse<AdminPostBriefDTO>> getAllAdminPostItems(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            WebRequest request) {
        Pageable safePageable = PageRequest.of(
                getSafePageNumber(pageable.getPageNumber()),
                getSafePageSize(pageable.getPageSize()),
                getSafeSort(pageable.getSort())
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
    public ResponseEntity<AdminPostDetailDTO> addPost(@Valid @RequestBody CreatePostRequestDTO request, @AuthenticationPrincipal Jwt jwt) throws URISyntaxException {
        UserPrincipal userPrincipal = userPrincipalService.convertJwtToUserPrincipal(jwt);
        AdminPostDetailDTO post = postCommandService.createPostForAdmin(request, userPrincipal);
        URI postLocation = new URI("admin/api/articles/" + post.content().id());
        return ResponseEntity.created(postLocation).body(post);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<AdminPostDetailDTO> patchPost(@PathVariable Long id, @Valid @RequestBody PatchPostRequestDTO request, @AuthenticationPrincipal Jwt jwt) {
        UserPrincipal userPrincipal = userPrincipalService.convertJwtToUserPrincipal(jwt);
        AdminPostDetailDTO post = postCommandService.patchPostForAdmin(id, request, userPrincipal);
        return ResponseEntity.ok(post);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AdminPostDetailDTO> putPost(@PathVariable Long id, @Valid @RequestBody PutPostRequestDTO request, @AuthenticationPrincipal Jwt jwt) {
        UserPrincipal userPrincipal = userPrincipalService.convertJwtToUserPrincipal(jwt);
        AdminPostDetailDTO post = postCommandService.putPostForAdmin(id, request, userPrincipal);
        return ResponseEntity.ok(post);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        UserPrincipal userPrincipal = userPrincipalService.convertJwtToUserPrincipal(jwt);
        postCommandService.deactivatePostForAdmin(id, userPrincipal);
        return ResponseEntity.noContent().build();
    }

    private Integer getSafePageNumber(Integer pageNumber) {
        return Math.max(pageNumber, 0);
    }

    private Integer getSafePageSize(Integer pageSize) {
        return Math.clamp(pageSize, 1, 100);
    }

    private Sort getSafeSort(Sort sort) {
        if (sort.isUnsorted()) {
            return Sort.by(Sort.Direction.DESC, "createdAt");
        }
        List<Sort.Order> validOrders = sort.stream()
                .filter(order -> allowedSortFields.contains(order.getProperty()))
                .toList();

        if (validOrders.size() != sort.stream().count()) {
            throw new IllegalArgumentException(
                    sort.stream().map(Sort.Order::getProperty).filter(p -> !allowedSortFields.contains(p)).collect(Collectors.joining(", "))
            );
        }
        return Sort.by(validOrders);
    }
}
