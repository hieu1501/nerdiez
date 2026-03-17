package com.tmb.csnerd.demo.controller;

import com.tmb.csnerd.demo.dto.topic.CreateTopicDTO;
import com.tmb.csnerd.demo.dto.topic.ReplaceTopicDTO;
import com.tmb.csnerd.demo.dto.topic.TopicResponseDTO;
import com.tmb.csnerd.demo.dto.topic.UpdateTopicDTO;
import com.tmb.csnerd.demo.service.topic.TopicCommandService;
import com.tmb.csnerd.demo.service.topic.TopicQueryService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@AllArgsConstructor
@RequestMapping("api/categories")
public class TopicController {
    private final TopicCommandService topicCommandService;
    private final TopicQueryService topicQueryService;

    @PostMapping
    public ResponseEntity<TopicResponseDTO> createTopic(@Valid @RequestBody CreateTopicDTO createTopicDTO) {
        TopicResponseDTO topicResponseDTO = topicCommandService.createTopic(createTopicDTO);
        return ResponseEntity.ok(topicResponseDTO);
    }

    @PutMapping("{/id}")
    public ResponseEntity<TopicResponseDTO> putTopic(@PathVariable Integer id, @Valid @RequestBody ReplaceTopicDTO replaceTopicDTO) {
        TopicResponseDTO topicResponseDTO = topicCommandService.putTopic(id, replaceTopicDTO);
        return ResponseEntity.ok(topicResponseDTO);
    }

    @PatchMapping("{/id}")
    public ResponseEntity<TopicResponseDTO> patchTopic(@PathVariable Integer id, @Valid @RequestBody UpdateTopicDTO updateTopicDTO) {
        TopicResponseDTO topicResponseDTO = topicCommandService.patchTopic(id, updateTopicDTO);
        return ResponseEntity.ok(topicResponseDTO);
    }

    @DeleteMapping("{/id}")
    public ResponseEntity<Void> deleteTopic(@PathVariable Integer id) {
        topicCommandService.deleteTopic(id);
        return ResponseEntity.ok().build();
    }
}
