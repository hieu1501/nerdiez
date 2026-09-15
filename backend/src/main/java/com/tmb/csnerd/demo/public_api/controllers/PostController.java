package com.tmb.csnerd.demo.public_api.controllers;

import com.tmb.csnerd.demo.domain.security.UserPrincipal;
import com.tmb.csnerd.demo.domain.services.auth.UserPrincipalService;
import com.tmb.csnerd.demo.dto.common.ETagResponse;
import com.tmb.csnerd.demo.dto.common.SliceResponse;
import com.tmb.csnerd.demo.dto.post.publicresponse.PersonalPostBriefDTO;
import com.tmb.csnerd.demo.dto.post.publicresponse.PersonalPostDetailDTO;
import com.tmb.csnerd.demo.dto.post.publicresponse.PublicPostBriefDTO;
import com.tmb.csnerd.demo.domain.services.post.PostQueryService;
import com.tmb.csnerd.demo.dto.post.publicresponse.PublicPostDetailDTO;
import com.tmb.csnerd.demo.utils.PageableUtils;
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

import java.util.Set;

@RestController
@AllArgsConstructor
public class PostController {
    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of("createdAt", "updatedAt", "title");

    private final PostQueryService postQueryService;
    private final UserPrincipalService userPrincipalService;
    private final PageableUtils pageableUtils;

    @GetMapping(
        path = "/api/categories/{categorySlug}/articles",
        produces = { MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE }
    )
    public ResponseEntity<SliceResponse<PublicPostBriefDTO>> getArticlesByCategorySlug(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            @PathVariable String categorySlug, WebRequest request) {
        Pageable safePageable = PageRequest.of(
                pageableUtils.getSafePageNumber(pageable.getPageNumber()),
                pageableUtils.getSafePageSize(pageable.getPageSize(), 30),
                pageableUtils.getSafeSort(pageable.getSort(), ALLOWED_SORT_FIELDS, "id")
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
        path = "/api/articles/{publicUri}",
        produces = { MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE }
    )
    public ResponseEntity<PublicPostDetailDTO> getArticle(@PathVariable String publicUri, @AuthenticationPrincipal Jwt jwt, WebRequest request) {
        UserPrincipal userPrincipal = userPrincipalService.convertJwtToUserPrincipal(jwt);
        ETagResponse<PublicPostDetailDTO> postDetailResponse = postQueryService.findPublicPostByPublicUri(publicUri, userPrincipal);
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

    @GetMapping(
        path = "/api/me/articles",
        produces = { MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE }
    )
    public ResponseEntity<SliceResponse<PersonalPostBriefDTO>> getArticlesForProfile(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            @AuthenticationPrincipal Jwt jwt,
            WebRequest request) {
        Pageable safePageable = PageRequest.of(
                pageableUtils.getSafePageNumber(pageable.getPageNumber()),
                pageableUtils.getSafePageSize(pageable.getPageSize(), 30),
                pageableUtils.getSafeSort(pageable.getSort(), ALLOWED_SORT_FIELDS, "id")
        );
        UserPrincipal userPrincipal = userPrincipalService.convertJwtToUserPrincipal(jwt);
        ETagResponse<Slice<PersonalPostBriefDTO>> postBriefSlice = postQueryService.getPostBriefSliceForProfile(userPrincipal, safePageable);
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
        path = "/api/me/articles/{publicUri}",
        produces = { MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE }
    )
    public ResponseEntity<PersonalPostDetailDTO> getArticleDetailForProfile(@PathVariable String publicUri, @AuthenticationPrincipal Jwt jwt, WebRequest request) {
        UserPrincipal userPrincipal = userPrincipalService.convertJwtToUserPrincipal(jwt);
        ETagResponse<PersonalPostDetailDTO> postDetailResponse = postQueryService.findPostByPublicUriForProfile(publicUri, userPrincipal);
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
}
