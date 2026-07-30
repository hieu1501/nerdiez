package com.tmb.csnerd.demo.public_api.controllers;

import com.tmb.csnerd.demo.dto.topic.TopicDetailDTO;
import com.tmb.csnerd.demo.domain.services.topic.TopicQueryService;
import lombok.AllArgsConstructor;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.util.List;

@RestController
@AllArgsConstructor
@RequestMapping("api/topics")
public class TopicController implements CacheableController {
    private final TopicQueryService topicQueryService;

    @GetMapping(path="/all")
    public ResponseEntity<List<TopicDetailDTO>> getAllTopics() {
        List<TopicDetailDTO> body = topicQueryService.getAllTopics();
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noCache())
                .eTag(buildETag(body.toString()))
                .body(body);
    }
}
