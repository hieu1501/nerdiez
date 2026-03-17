package com.tmb.csnerd.demo.service.topic;

import com.tmb.csnerd.demo.repository.TopicRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@AllArgsConstructor
@Service
public class TopicQueryService {
    private final TopicRepository topicRepository;
}
