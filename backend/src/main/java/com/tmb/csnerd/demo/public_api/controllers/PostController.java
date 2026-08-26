package com.tmb.csnerd.demo.public_api.controllers;

import com.tmb.csnerd.demo.domain.security.UserPrincipal;
import com.tmb.csnerd.demo.domain.services.auth.UserPrincipalService;
import com.tmb.csnerd.demo.dto.common.ETagResponse;
import com.tmb.csnerd.demo.dto.common.SliceResponse;
import com.tmb.csnerd.demo.dto.post.publicresponse.PublicPostBriefDTO;
import com.tmb.csnerd.demo.domain.services.post.PostCommandService;
import com.tmb.csnerd.demo.domain.services.post.PostQueryService;
import com.tmb.csnerd.demo.dto.post.publicresponse.PublicPostDetailDTO;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.context.request.WebRequest;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@AllArgsConstructor
@RequestMapping("/api/articles")
public class PostController {
    private final PostQueryService postQueryService;
    private final UserPrincipalService userPrincipalService;

    final Set<String> allowedSortFields = Set.of("createdAt", "updatedAt", "title");

    @GetMapping(
        path = "/{categorySlug}",
        produces = { MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE }
    )
    public ResponseEntity<SliceResponse<PublicPostBriefDTO>> getArticlesByCategorySlug(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            @PathVariable String categorySlug, WebRequest request) {
        Pageable safePageable = PageRequest.of(
                getSafePageNumber(pageable.getPageNumber()),
                getSafePageSize(pageable.getPageSize()),
                getSafeSort(pageable.getSort())
        );
        ETagResponse<Slice<PublicPostBriefDTO>> postBriefSlice = postQueryService.getPostBriefSliceByCategorySlug(categorySlug, safePageable);
        String eTag = postBriefSlice.eTag();
        if (request.checkNotModified(eTag)) {
            return null;
        }
        return ResponseEntity.ok()
                .header(HttpHeaders.VARY, "Accept-Encoding", "User-Agent")
                .cacheControl(CacheControl.noCache())
                .eTag(eTag)
                .body(SliceResponse.from(postBriefSlice.content()));
    }

    @GetMapping(
        path = "/{categorySlug}/{postSlugName}",
        produces = { MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE }
    )
    public ResponseEntity<PublicPostDetailDTO> getArticle(@PathVariable String categorySlug, @PathVariable String postSlugName, @AuthenticationPrincipal Jwt jwt, WebRequest request) {
        UserPrincipal userPrincipal = userPrincipalService.convertJwtToUserPrincipal(jwt);
        ETagResponse<PublicPostDetailDTO> postDetailResponse = postQueryService.findPublicPostByCategorySlugAndSlugName(categorySlug, postSlugName, userPrincipal);
        String eTag = postDetailResponse.eTag();
        if (request.checkNotModified(eTag)) {
            return null;
        }
        return ResponseEntity.ok()
                .header(HttpHeaders.VARY, "Accept-Encoding", "User-Agent")
                .cacheControl(CacheControl.noCache())
                .eTag(eTag)
                .body(postDetailResponse.content());
    }

    private Integer getSafePageNumber(Integer pageNumber) {
        return Math.max(pageNumber, 0);
    }

    private Integer getSafePageSize(Integer pageSize) {
        return Math.clamp(pageSize, 1, 20);
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
