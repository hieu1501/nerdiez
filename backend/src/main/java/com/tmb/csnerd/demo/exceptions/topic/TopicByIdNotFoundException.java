package com.tmb.csnerd.demo.exceptions.topic;

import com.tmb.csnerd.demo.exceptions.ResourceNotFoundException;

public class TopicByIdNotFoundException extends ResourceNotFoundException {
    public TopicByIdNotFoundException(Long topicId) {
        super("Topic not found: " + topicId);
    }
}
