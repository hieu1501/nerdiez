package com.tmb.csnerd.demo.admin.controllers;

import com.tmb.csnerd.demo.dto.topic.CreateTopicDTO;
import com.tmb.csnerd.demo.dto.topic.ReplaceTopicDTO;
import com.tmb.csnerd.demo.dto.topic.TopicResponseDTO;
import com.tmb.csnerd.demo.dto.topic.UpdateTopicDTO;
import com.tmb.csnerd.demo.domain.services.topic.TopicCommandService;
import com.tmb.csnerd.demo.domain.services.topic.TopicQueryService;
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
    public ResponseEntity<TopicResponseDTO> createTopic(@Valid @RequestBody CreateTopicDTO createTopicDTO) {
        TopicResponseDTO topicResponseDTO = topicCommandService.createTopic(createTopicDTO);
        return ResponseEntity.ok(topicResponseDTO);
    }

    @PutMapping(
            path = "/{id}",
            consumes = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<TopicResponseDTO> putTopic(@PathVariable Long id, @Valid @RequestBody ReplaceTopicDTO replaceTopicDTO) {
        TopicResponseDTO topicResponseDTO = topicCommandService.putTopic(id, replaceTopicDTO);
        return ResponseEntity.ok(topicResponseDTO);
    }

    @PatchMapping(
            path = "/{id}",
            consumes = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<TopicResponseDTO> patchTopic(@PathVariable Long id, @Valid @RequestBody UpdateTopicDTO updateTopicDTO) {
        TopicResponseDTO topicResponseDTO = topicCommandService.patchTopic(id, updateTopicDTO);
        return ResponseEntity.ok(topicResponseDTO);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTopic(@PathVariable Long id) {
        topicCommandService.deleteTopic(id);
        return ResponseEntity.ok().build();
    }
}
