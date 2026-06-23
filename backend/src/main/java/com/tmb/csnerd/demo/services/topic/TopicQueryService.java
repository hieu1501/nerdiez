package com.tmb.csnerd.demo.services.topic;

import com.tmb.csnerd.demo.repositories.TopicRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@AllArgsConstructor
@Service
public class TopicQueryService {
    private final TopicRepository topicRepository;
}
