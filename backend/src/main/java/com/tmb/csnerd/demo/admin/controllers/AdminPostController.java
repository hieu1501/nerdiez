package com.tmb.csnerd.demo.admin.controllers;

import com.tmb.csnerd.demo.domain.services.post.PostCommandService;
import com.tmb.csnerd.demo.domain.services.post.PostQueryService;
import com.tmb.csnerd.demo.dto.post.AdminPostItemDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("admin/api/articles")
@RequiredArgsConstructor
public class AdminPostController {
    private final PostCommandService postCommandService;
    private final PostQueryService postQueryService;

    public ResponseEntity<List<AdminPostItemDTO>> getAllAdminPostItems(){
        List<AdminPostItemDTO> allPostsForAdmin =  postQueryService.getAllPostsForAdmin();
        return ResponseEntity.ok(allPostsForAdmin);
    }
}
