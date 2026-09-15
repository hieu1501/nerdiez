package com.tmb.csnerd.demo.public_api.controllers;

import com.tmb.csnerd.demo.domain.security.UserPrincipal;
import com.tmb.csnerd.demo.domain.services.auth.UserPrincipalService;
import com.tmb.csnerd.demo.domain.services.post.PostCommandService;
import com.tmb.csnerd.demo.dto.post.publicresponse.PersonalPostDetailDTO;
import com.tmb.csnerd.demo.dto.post.request.AdminCreatePostRequestDTO;
import com.tmb.csnerd.demo.dto.post.request.AdminPatchPostRequestDTO;
import com.tmb.csnerd.demo.dto.post.request.PublicCreatePostRequestDTO;
import com.tmb.csnerd.demo.dto.post.request.PublicPatchPostRequestDTO;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.net.URISyntaxException;

@RestController
@AllArgsConstructor
@RequestMapping("/api/articles")
public class PostCommandController {
    private final PostCommandService postCommandService;
    private final UserPrincipalService userPrincipalService;

    @PostMapping(
        consumes = MediaType.APPLICATION_JSON_VALUE,
        produces = { MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE }
    )
    public ResponseEntity<PersonalPostDetailDTO> addPost(@Valid @RequestBody PublicCreatePostRequestDTO request, @AuthenticationPrincipal Jwt jwt) {
        UserPrincipal userPrincipal = userPrincipalService.convertJwtToUserPrincipal(jwt);
        PersonalPostDetailDTO post = postCommandService.createPostForProfile(request, userPrincipal);
        return ResponseEntity.created(post.content().canonicalUri()).body(post);
    }

    @PatchMapping(
        path = "/{publicUri}",
        consumes = MediaType.APPLICATION_JSON_VALUE,
        produces = { MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE }
    )
    public ResponseEntity<PersonalPostDetailDTO> patchPost(@PathVariable String publicUri, @Valid @RequestBody PublicPatchPostRequestDTO request, @AuthenticationPrincipal Jwt jwt) {
        UserPrincipal userPrincipal = userPrincipalService.convertJwtToUserPrincipal(jwt);
        PersonalPostDetailDTO post = postCommandService.patchPostByPublicUri(publicUri, request, userPrincipal);
        return ResponseEntity.ok(post);
    }


    @DeleteMapping(
        path = "/{publicUri}"
    )
    public ResponseEntity<Void> deletePost(@PathVariable String publicUri, @AuthenticationPrincipal Jwt jwt) {
        UserPrincipal userPrincipal = userPrincipalService.convertJwtToUserPrincipal(jwt);
        postCommandService.hardDeletePostByPublicUri(publicUri, userPrincipal);
        return ResponseEntity.noContent().build();
    }

}
