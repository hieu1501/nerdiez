package com.tmb.csnerd.demo.admin.controllers;

import com.tmb.csnerd.demo.dto.category.CategoryDetailDTO;
import com.tmb.csnerd.demo.dto.category.CreateCategoryRequestDTO;
import com.tmb.csnerd.demo.dto.category.ReplaceCategoryRequestDTO;
import com.tmb.csnerd.demo.dto.category.UpdateCategoryRequestDTO;
import com.tmb.csnerd.demo.domain.services.category.CategoryCommandService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@AllArgsConstructor
@RequestMapping("admin/api/categories")
public class AdminCategoryController {
    private final CategoryCommandService categoryCommandService;

    @PostMapping(
        consumes = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<CategoryDetailDTO> createCategory(@Valid @RequestBody CreateCategoryRequestDTO createCategoryDTO) {
        CategoryDetailDTO categoryDetailDTO = categoryCommandService.createCategory(createCategoryDTO);
        return ResponseEntity.ok(categoryDetailDTO);
    }

    @PutMapping(
        path = "/{id}",
        consumes = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<CategoryDetailDTO> putCategory(@PathVariable Long id, @Valid @RequestBody ReplaceCategoryRequestDTO replaceCategoryRequestDTO) {
        CategoryDetailDTO categoryDetailDTO = categoryCommandService.putCategory(id, replaceCategoryRequestDTO);
        return ResponseEntity.ok(categoryDetailDTO);
    }

    @PatchMapping(
        path = "/{id}",
        consumes = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<CategoryDetailDTO> patchCategory(@PathVariable Long id, @Valid @RequestBody UpdateCategoryRequestDTO updateCategoryRequestDTO) {
        CategoryDetailDTO categoryDetailDTO = categoryCommandService.patchCategory(id, updateCategoryRequestDTO);
        return ResponseEntity.ok(categoryDetailDTO);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        categoryCommandService.deleteCategory(id);
        return ResponseEntity.ok().build();
    }
}
