package com.tmb.csnerd.demo.public_api.controllers;

import com.tmb.csnerd.demo.dto.common.ETagResponse;
import com.tmb.csnerd.demo.dto.topic.adminresponse.TopicAdminDetailDTO;
import com.tmb.csnerd.demo.domain.services.topic.TopicQueryService;
import com.tmb.csnerd.demo.dto.topic.publicresponse.TopicPublicDetailDTO;
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
@RequestMapping("api/topics")
public class TopicController {
    private final TopicQueryService topicQueryService;

    @GetMapping(
        path="/all",
        produces = { MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE }
    )
    public ResponseEntity<List<TopicPublicDetailDTO>> getAllTopicsForPublic(WebRequest webRequest) {
        ETagResponse<List<TopicPublicDetailDTO>> topicPublicListResponse = topicQueryService.getAllTopicsForPublic();
        String eTag = topicPublicListResponse.eTag();
        if (webRequest.checkNotModified(eTag)) {
            return null;
        }
        return ResponseEntity.ok()
                .header(HttpHeaders.VARY, "Accept-Encoding", "User-Agent")
                .cacheControl(CacheControl.noCache())
                .eTag(eTag)
                .body(topicPublicListResponse.content());
    }
}
