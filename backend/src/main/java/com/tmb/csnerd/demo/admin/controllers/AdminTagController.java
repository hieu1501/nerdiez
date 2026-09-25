package com.tmb.csnerd.demo.admin.controllers;

import com.tmb.csnerd.demo.domain.services.tag.TagQueryService;
import com.tmb.csnerd.demo.dto.common.ETagResponse;
import com.tmb.csnerd.demo.dto.tag.request.CreateTagRequestDTO;
import com.tmb.csnerd.demo.dto.tag.adminresponse.TagAdminDetailDTO;
import com.tmb.csnerd.demo.dto.tag.request.UpdateTagRequestDTO;
import com.tmb.csnerd.demo.domain.services.tag.TagCommandService;
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
@RequestMapping("admin/api/tags")
public class AdminTagController {
    private final TagCommandService tagCommandService;
    private final TagQueryService tagQueryService;

    @GetMapping(
        produces = { MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE }
    )
    public ResponseEntity<List<TagAdminDetailDTO>> getAllTagsForAdmin(WebRequest webRequest) {
        ETagResponse<List<TagAdminDetailDTO>> tagAdminListResponse = tagQueryService.getAllTagsForAdmin();
        String eTag = tagAdminListResponse.eTag();
        if (webRequest.checkNotModified(eTag)) {
            return null;
        }
        return ResponseEntity.ok()
                .header(HttpHeaders.VARY, "Accept-Encoding", "User-Agent")
                .cacheControl(CacheControl.noCache())
                .eTag(eTag)
                .body(tagAdminListResponse.content());
    }

    @PostMapping(
        consumes = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<TagAdminDetailDTO> createTag(@Valid @RequestBody CreateTagRequestDTO createTagRequestDTO) {
        TagAdminDetailDTO tagAdminDetailDTO = tagCommandService.createTag(createTagRequestDTO);
        return ResponseEntity.ok(tagAdminDetailDTO);
    }

    @PatchMapping(
        path = "/{id}",
        consumes = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<TagAdminDetailDTO> patchTag(@PathVariable Long id, @Valid @RequestBody UpdateTagRequestDTO updateTagRequestDTO) {
        TagAdminDetailDTO tagAdminDetailDTO = tagCommandService.patchTag(id, updateTagRequestDTO);
        return ResponseEntity.ok(tagAdminDetailDTO);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTag(@PathVariable Long id) {
        tagCommandService.deleteTag(id);
        return ResponseEntity.ok().build();
    }
}
