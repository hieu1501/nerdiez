package com.tmb.csnerd.demo.exceptions.topic;

import com.tmb.csnerd.demo.exceptions.ResourceNotFoundException;

public class TopicNotFoundException extends ResourceNotFoundException {
    public TopicNotFoundException(Long topicId) {
        super("Topic not found: " + topicId);
    }
}
