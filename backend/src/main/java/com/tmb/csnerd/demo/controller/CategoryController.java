package com.tmb.csnerd.demo.controller;

import com.tmb.csnerd.demo.dto.category.CategoryResponseDTO;
import com.tmb.csnerd.demo.dto.category.CreateCategoryDTO;
import com.tmb.csnerd.demo.dto.category.ReplaceCategoryDTO;
import com.tmb.csnerd.demo.dto.category.UpdateCategoryDTO;
import com.tmb.csnerd.demo.repository.CategoryRepository;
import com.tmb.csnerd.demo.service.category.CategoryCommandService;
import com.tmb.csnerd.demo.service.category.CategoryQueryService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@AllArgsConstructor
@RequestMapping("api/categories")
public class CategoryController {
    private final CategoryCommandService categoryCommandService;
    private final CategoryQueryService categoryQueryService;

    @PostMapping(
        consumes = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<CategoryResponseDTO> createCategory(@Valid @RequestBody CreateCategoryDTO createCategoryDTO) {
        CategoryResponseDTO categoryResponseDTO = categoryCommandService.createCategory(createCategoryDTO);
        return ResponseEntity.ok(categoryResponseDTO);
    }

    @PutMapping(
        path = "/{id}",
        consumes = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<CategoryResponseDTO> putCategory(@PathVariable Long id, @Valid @RequestBody ReplaceCategoryDTO replaceCategoryDTO) {
        CategoryResponseDTO categoryResponseDTO = categoryCommandService.putCategory(id, replaceCategoryDTO);
        return ResponseEntity.ok(categoryResponseDTO);
    }

    @PatchMapping(
        path = "/{id}",
        consumes = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<CategoryResponseDTO> patchCategory(@PathVariable Long id, @Valid @RequestBody UpdateCategoryDTO updateCategoryDTO) {
        CategoryResponseDTO categoryResponseDTO = categoryCommandService.patchCategory(id, updateCategoryDTO);
        return ResponseEntity.ok(categoryResponseDTO);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        categoryCommandService.deleteCategory(id);
        return ResponseEntity.ok().build();
    }
}
