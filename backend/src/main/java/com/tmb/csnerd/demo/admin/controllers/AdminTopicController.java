package com.tmb.csnerd.demo.admin.controllers;

import com.tmb.csnerd.demo.domain.services.topic.TopicQueryService;
import com.tmb.csnerd.demo.dto.common.ETagResponse;
import com.tmb.csnerd.demo.dto.topic.publicresponse.TopicPublicDetailDTO;
import com.tmb.csnerd.demo.dto.topic.request.CreateTopicRequestDTO;
import com.tmb.csnerd.demo.dto.topic.request.ReplaceTopicRequestDTO;
import com.tmb.csnerd.demo.dto.topic.adminresponse.TopicAdminDetailDTO;
import com.tmb.csnerd.demo.dto.topic.request.UpdateTopicRequestDTO;
import com.tmb.csnerd.demo.domain.services.topic.TopicCommandService;
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
@RequestMapping("admin/api/topics")
public class AdminTopicController {
    private final TopicCommandService topicCommandService;
    private final TopicQueryService topicQueryService;

    @GetMapping(
        path="/all",
        produces = { MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE }
    )
    public ResponseEntity<List<TopicAdminDetailDTO>> getAllTopicsForAdmin(WebRequest webRequest) {
        ETagResponse<List<TopicAdminDetailDTO>> topicAdminListResponse = topicQueryService.getAllTopicsForAdmin();
        String eTag = topicAdminListResponse.eTag();
        if (webRequest.checkNotModified(eTag)) {
            return null;
        }
        return ResponseEntity.ok()
                .header(HttpHeaders.VARY, "Accept-Encoding", "User-Agent")
                .cacheControl(CacheControl.noCache())
                .eTag(eTag)
                .body(topicAdminListResponse.content());
    }

    @PostMapping(
        consumes = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<TopicAdminDetailDTO> createTopic(@Valid @RequestBody CreateTopicRequestDTO createTopicRequestDTO) {
        TopicAdminDetailDTO topicAdminDetailDTO = topicCommandService.createTopic(createTopicRequestDTO);
        return ResponseEntity.ok(topicAdminDetailDTO);
    }

    @PutMapping(
        path = "/{id}",
        consumes = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<TopicAdminDetailDTO> putTopic(@PathVariable Long id, @Valid @RequestBody ReplaceTopicRequestDTO replaceTopicRequestDTO) {
        TopicAdminDetailDTO topicAdminDetailDTO = topicCommandService.putTopic(id, replaceTopicRequestDTO);
        return ResponseEntity.ok(topicAdminDetailDTO);
    }

    @PatchMapping(
        path = "/{id}",
        consumes = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<TopicAdminDetailDTO> patchTopic(@PathVariable Long id, @Valid @RequestBody UpdateTopicRequestDTO updateTopicRequestDTO) {
        TopicAdminDetailDTO topicAdminDetailDTO = topicCommandService.patchTopic(id, updateTopicRequestDTO);
        return ResponseEntity.ok(topicAdminDetailDTO);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTopic(@PathVariable Long id) {
        topicCommandService.deleteTopic(id);
        return ResponseEntity.ok().build();
    }
}
