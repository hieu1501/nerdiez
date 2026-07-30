package com.tmb.csnerd.demo.admin.controllers;

import com.tmb.csnerd.demo.dto.topic.CreateTopicRequestDTO;
import com.tmb.csnerd.demo.dto.topic.ReplaceTopicRequestDTO;
import com.tmb.csnerd.demo.dto.topic.TopicDetailDTO;
import com.tmb.csnerd.demo.dto.topic.UpdateTopicRequestDTO;
import com.tmb.csnerd.demo.domain.services.topic.TopicCommandService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@AllArgsConstructor
@RequestMapping("admin/api/topics")
public class AdminTopicController {
    private final TopicCommandService topicCommandService;

    @PostMapping(
        consumes = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<TopicDetailDTO> createTopic(@Valid @RequestBody CreateTopicRequestDTO createTopicRequestDTO) {
        TopicDetailDTO topicDetailDTO = topicCommandService.createTopic(createTopicRequestDTO);
        return ResponseEntity.ok(topicDetailDTO);
    }

    @PutMapping(
        path = "/{id}",
        consumes = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<TopicDetailDTO> putTopic(@PathVariable Long id, @Valid @RequestBody ReplaceTopicRequestDTO replaceTopicRequestDTO) {
        TopicDetailDTO topicDetailDTO = topicCommandService.putTopic(id, replaceTopicRequestDTO);
        return ResponseEntity.ok(topicDetailDTO);
    }

    @PatchMapping(
        path = "/{id}",
        consumes = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<TopicDetailDTO> patchTopic(@PathVariable Long id, @Valid @RequestBody UpdateTopicRequestDTO updateTopicRequestDTO) {
        TopicDetailDTO topicDetailDTO = topicCommandService.patchTopic(id, updateTopicRequestDTO);
        return ResponseEntity.ok(topicDetailDTO);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTopic(@PathVariable Long id) {
        topicCommandService.deleteTopic(id);
        return ResponseEntity.ok().build();
    }
}
