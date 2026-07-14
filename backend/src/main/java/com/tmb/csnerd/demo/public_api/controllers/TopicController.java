package com.tmb.csnerd.demo.public_api.controllers;

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

import java.util.List;

@RestController
@AllArgsConstructor
@RequestMapping("api/topics")
public class TopicController {
    private final TopicQueryService topicQueryService;

    @GetMapping(path="/all")
    public ResponseEntity<List<TopicResponseDTO>> getAllTopics() {
        List<TopicResponseDTO> topics = topicQueryService.getAllTopics();
        return ResponseEntity.ok(topics);
    }
}
