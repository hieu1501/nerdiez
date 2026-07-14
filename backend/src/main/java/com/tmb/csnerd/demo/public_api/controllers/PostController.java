package com.tmb.csnerd.demo.public_api.controllers;

import com.tmb.csnerd.demo.dto.post.*;
import com.tmb.csnerd.demo.exceptions.post.PostNotFoundException;
import com.tmb.csnerd.demo.domain.security.UserPrincipal;
import com.tmb.csnerd.demo.domain.services.post.PostCommandService;
import com.tmb.csnerd.demo.domain.services.post.PostQueryService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;

@RestController
@AllArgsConstructor
@RequestMapping("/api/articles")
public class PostController {
    private final PostCommandService postCommandService;
    private final PostQueryService postQueryService;

    @GetMapping(
        produces = { MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE }
    )
    public ResponseEntity<PostsOverviewDTO> getAllArticles() {
        PostsOverviewDTO postsOverviewDTO = new PostsOverviewDTO(
            postQueryService.findMostRecentActivePost(),
            List.of(),
            postQueryService.findMostUpvotedActivePost()
        );
        return ResponseEntity.ok(postsOverviewDTO);
    }

    @GetMapping(
        path = "/{id}",
        produces = { MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE }
    )
    public ResponseEntity<PostItemDTO> getArticle(@PathVariable Long id) {
        PostItemDTO post = postQueryService.findArticle(id);
        if (post == null) {
            throw new PostNotFoundException(id);
        }
        return ResponseEntity.ok(post);
    }

    @PostMapping
    public ResponseEntity<PostItemDTO> addPost(@Valid @RequestBody CreatePostDTO request, @AuthenticationPrincipal UserPrincipal user) throws URISyntaxException {
        PostItemDTO post = postCommandService.createPost(request, user);
        URI postLocation = new URI("/api/articles/" + post.slug());
        return ResponseEntity.created(postLocation).body(post);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<PostItemDTO> patchPost(@PathVariable Long id, @Valid @RequestBody UpdatePostDTO request, @AuthenticationPrincipal UserPrincipal user) {
        PostItemDTO post = postCommandService.patchPost(id, request, user);
        return ResponseEntity.ok(post);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PostItemDTO> putPost(@PathVariable Long id, @Valid @RequestBody ReplacePostDTO request, @AuthenticationPrincipal UserPrincipal user) {
        PostItemDTO post = postCommandService.putPost(id, request, user);
        return ResponseEntity.ok(post);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal user) {
        postCommandService.deletePost(id, user);
        return ResponseEntity.noContent().build();
    }
}
