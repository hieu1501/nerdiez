package com.tmb.csnerd.demo.exception.topic;

import com.tmb.csnerd.demo.exception.ResourceNotFoundException;

public class TopicNotFound extends ResourceNotFoundException {
    public TopicNotFound(Long topicId) {
        super("Topic not found: " + topicId);
    }
}
