package com.tmb.csnerd.demo.public_api.controllers;

import com.tmb.csnerd.demo.dto.post.*;
import com.tmb.csnerd.demo.exceptions.post.PostNotFoundException;
import com.tmb.csnerd.demo.domain.services.post.PostCommandService;
import com.tmb.csnerd.demo.domain.services.post.PostQueryService;
import lombok.AllArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
    public ResponseEntity<PublicOverviewPostsDTO> getAllArticles() {
        PublicOverviewPostsDTO publicOverviewPostsDTO = new PublicOverviewPostsDTO(
            postQueryService.findRecentActivePosts(),
            List.of(),
            postQueryService.findUpvotedDescActivePosts()
        );
        return ResponseEntity.ok(publicOverviewPostsDTO);
    }

    @GetMapping(
        path = "/{id}",
        produces = { MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE }
    )
    public ResponseEntity<PublicPostDetailDTO> getArticle(@PathVariable Long id) {
        PublicPostDetailDTO post = postQueryService.findPublicPost(id);
        if (post == null) {
            throw new PostNotFoundException(id);
        }
        return ResponseEntity.ok(post);
    }
}
