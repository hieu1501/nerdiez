package com.tmb.csnerd.demo.public_api.controllers;

import com.tmb.csnerd.demo.dto.category.CategoryResponseDTO;
import com.tmb.csnerd.demo.domain.services.category.CategoryQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/categories")
public class CategoryController {
    private final CategoryQueryService categoryQueryService;

    @GetMapping(path="/all")
    public ResponseEntity<List<CategoryResponseDTO>> getAllCategories() {
        List<CategoryResponseDTO> categoryResponseDTOs = categoryQueryService.getAllCategories();
        return ResponseEntity.ok(categoryResponseDTOs);
    }
}
