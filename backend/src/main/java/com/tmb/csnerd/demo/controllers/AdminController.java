package com.tmb.csnerd.demo.controllers;

import com.tmb.csnerd.demo.dto.post.PostItemDTO;
import com.tmb.csnerd.demo.services.post.PostCommandService;
import com.tmb.csnerd.demo.services.post.PostQueryService;
import lombok.AllArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@AllArgsConstructor
@RequestMapping("/api/admin")
public class AdminController {
    private final PostCommandService postCommandService;
    private final PostQueryService postQueryService;

    @GetMapping(
        path = "/articles",
        produces = { MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE }
    )
    public ResponseEntity<List<PostItemDTO>> getAllArticlesForAdmin() {
        List<PostItemDTO> allPostsDTO = postQueryService.getAllPostsForAdmin();
        return ResponseEntity.ok(allPostsDTO);
    }
}
