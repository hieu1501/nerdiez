package com.tmb.csnerd.demo.public_api.controllers;

import com.tmb.csnerd.demo.domain.services.category.CategoryQueryService;
import com.tmb.csnerd.demo.dto.category.adminresponse.CategoryAdminDetailDTO;
import com.tmb.csnerd.demo.dto.category.publicresponse.CategoryPublicDetailDTO;
import com.tmb.csnerd.demo.dto.common.ETagResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.context.request.WebRequest;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/categories")
public class CategoryController {
    private final CategoryQueryService categoryQueryService;

    @GetMapping(
        path="/all",
        produces = { MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE }
    )
    public ResponseEntity<List<CategoryPublicDetailDTO>> getAllCategoriesForPublic(WebRequest request) {
        ETagResponse<List<CategoryPublicDetailDTO>> categoryPublicListResponse = categoryQueryService.getAllCategoriesForPublic();
        String eTag = categoryPublicListResponse.eTag();
        if (request.checkNotModified(eTag)) {
            return null;
        }
        return ResponseEntity.ok()
                .header(HttpHeaders.VARY, "Accept-Encoding", "User-Agent")
                .cacheControl(CacheControl.noCache())
                .eTag(eTag)
                .body(categoryPublicListResponse.content());
    }
}
