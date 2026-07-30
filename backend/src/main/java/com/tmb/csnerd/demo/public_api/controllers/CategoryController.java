package com.tmb.csnerd.demo.public_api.controllers;

import com.tmb.csnerd.demo.dto.category.CategoryDetailDTO;
import com.tmb.csnerd.demo.domain.services.category.CategoryQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/categories")
public class CategoryController implements CacheableController {
    private final CategoryQueryService categoryQueryService;

    @GetMapping(path="/all")
    public ResponseEntity<List<CategoryDetailDTO>> getAllCategories() {
        List<CategoryDetailDTO> body = categoryQueryService.getAllCategories();
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noCache())
                .eTag(buildETag(body.toString()))
                .body(body);
    }
}
