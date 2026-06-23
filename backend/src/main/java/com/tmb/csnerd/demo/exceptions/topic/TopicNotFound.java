package com.tmb.csnerd.demo.exceptions.topic;

import com.tmb.csnerd.demo.exceptions.ResourceNotFoundException;

public class TopicNotFound extends ResourceNotFoundException {
    public TopicNotFound(Long topicId) {
        super("Topic not found: " + topicId);
    }
}
