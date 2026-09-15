package com.tmb.csnerd.demo.public_api.controllers;

import com.tmb.csnerd.demo.dto.common.ETagResponse;
import com.tmb.csnerd.demo.domain.services.tag.TagQueryService;
import com.tmb.csnerd.demo.dto.tag.publicresponse.TagPublicDetailDTO;
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
@RequestMapping("api/tags")
public class TagController {
    private final TagQueryService tagQueryService;

    @GetMapping(
        produces = { MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE }
    )
    public ResponseEntity<List<TagPublicDetailDTO>> getAllTagsForPublic(WebRequest webRequest) {
        ETagResponse<List<TagPublicDetailDTO>> tagPublicListResponse = tagQueryService.getAllTagsForPublic();
        String eTag = tagPublicListResponse.eTag();
        if (webRequest.checkNotModified(eTag)) {
            return null;
        }
        return ResponseEntity.ok()
                .header(HttpHeaders.VARY, "Accept-Encoding", "User-Agent")
                .cacheControl(CacheControl.noCache())
                .eTag(eTag)
                .body(tagPublicListResponse.content());
    }
}
