package com.tmb.csnerd.demo.admin.controllers;

import com.tmb.csnerd.demo.domain.services.category.CategoryQueryService;
import com.tmb.csnerd.demo.dto.category.adminresponse.CategoryAdminDetailDTO;
import com.tmb.csnerd.demo.dto.category.request.CreateCategoryRequestDTO;
import com.tmb.csnerd.demo.dto.category.request.ReplaceCategoryRequestDTO;
import com.tmb.csnerd.demo.dto.category.request.UpdateCategoryRequestDTO;
import com.tmb.csnerd.demo.domain.services.category.CategoryCommandService;
import com.tmb.csnerd.demo.dto.common.ETagResponse;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.context.request.WebRequest;

import java.util.List;

@RestController
@AllArgsConstructor
@RequestMapping("admin/api/categories")
public class AdminCategoryController {
    private final CategoryCommandService categoryCommandService;
    private final CategoryQueryService categoryQueryService;

    @GetMapping(
        path="/all",
        produces = { MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE }
    )
    public ResponseEntity<List<CategoryAdminDetailDTO>> getAllCategories(WebRequest request) {
        ETagResponse<List<CategoryAdminDetailDTO>> categoryAdminListResponse = categoryQueryService.getAllCategoriesForAdmin();
        String eTag = categoryAdminListResponse.eTag();
        if (request.checkNotModified(eTag)) {
            return null;
        }
        return ResponseEntity.ok()
                .header(HttpHeaders.VARY, "Accept-Encoding", "User-Agent")
                .cacheControl(CacheControl.noCache())
                .eTag(eTag)
                .body(categoryAdminListResponse.content());
    }

    @PostMapping(
        consumes = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<CategoryAdminDetailDTO> createCategory(@Valid @RequestBody CreateCategoryRequestDTO createCategoryDTO) {
        CategoryAdminDetailDTO categoryAdminDetailDTO = categoryCommandService.createCategory(createCategoryDTO);
        return ResponseEntity.ok(categoryAdminDetailDTO);
    }

    @PutMapping(
        path = "/{id}",
        consumes = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<CategoryAdminDetailDTO> putCategory(@PathVariable Long id, @Valid @RequestBody ReplaceCategoryRequestDTO replaceCategoryRequestDTO) {
        CategoryAdminDetailDTO categoryAdminDetailDTO = categoryCommandService.putCategory(id, replaceCategoryRequestDTO);
        return ResponseEntity.ok(categoryAdminDetailDTO);
    }

    @PatchMapping(
        path = "/{id}",
        consumes = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<CategoryAdminDetailDTO> patchCategory(@PathVariable Long id, @Valid @RequestBody UpdateCategoryRequestDTO updateCategoryRequestDTO) {
        CategoryAdminDetailDTO categoryAdminDetailDTO = categoryCommandService.patchCategory(id, updateCategoryRequestDTO);
        return ResponseEntity.ok(categoryAdminDetailDTO);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        categoryCommandService.deleteCategory(id);
        return ResponseEntity.ok().build();
    }
}
