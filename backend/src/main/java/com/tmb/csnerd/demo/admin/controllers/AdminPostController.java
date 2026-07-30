package com.tmb.csnerd.demo.admin.controllers;

import com.tmb.csnerd.demo.domain.security.UserPrincipal;
import com.tmb.csnerd.demo.domain.services.auth.UserPrincipalService;
import com.tmb.csnerd.demo.domain.services.post.PostCommandService;
import com.tmb.csnerd.demo.domain.services.post.PostQueryService;
import com.tmb.csnerd.demo.dto.post.*;
import com.tmb.csnerd.demo.public_api.controllers.CacheableController;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.AbstractController;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;

@RestController
@RequestMapping("admin/api/articles")
@RequiredArgsConstructor
public class AdminPostController implements CacheableController {
    private final PostCommandService postCommandService;
    private final PostQueryService postQueryService;
    private final UserPrincipalService userPrincipalService;

    @GetMapping(
        path = "/all",
        produces = { MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE }
    )
    public ResponseEntity<List<AdminPostBriefDTO>> getAllAdminPostItems(){
        List<AdminPostBriefDTO> body = postQueryService.getAllPostsForAdmin();
        StringBuilder stringBuilder = new StringBuilder();
        for ( AdminPostBriefDTO dto : body ){
            stringBuilder.append(dto.id().toString()).append(";").append(dto.updatedAt().toString())    ;
        }
        String identifier = stringBuilder.toString();
        if (identifier.isEmpty()) {
            identifier = "empty"; // Hardcode etag for empty resource
        }
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noCache())
                .eTag(buildETag(identifier))
                .body(body);
    }

    @GetMapping(
        path = "/{id}",
        produces = { MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE }
    )
    public ResponseEntity<AdminPostDetailDTO> getPostItemForAdmin(@PathVariable Long id, WebRequest request) {
        AdminPostDetailDTO body = postQueryService.findPostForAdmin(id);
        long lastModified = body.updatedAt().toEpochMilli();
        if (request.checkNotModified(lastModified)) return null;
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noCache())
                .lastModified(lastModified)
                .body(body);
    }

    @PostMapping(
        consumes = MediaType.APPLICATION_JSON_VALUE,
        produces = { MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE }
    )
    public ResponseEntity<AdminPostDetailDTO> addPost(@Valid @RequestBody CreatePostRequestDTO request, @AuthenticationPrincipal Jwt jwt) throws URISyntaxException {
        UserPrincipal userPrincipal = userPrincipalService.convertJwtToUserPrincipal(jwt);
        AdminPostDetailDTO post = postCommandService.createPostForAdmin(request, userPrincipal);
        URI postLocation = new URI("admin/api/articles/" + post.id());
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
}
