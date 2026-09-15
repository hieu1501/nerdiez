package com.tmb.csnerd.demo.exceptions.topic;

import com.tmb.csnerd.demo.exceptions.ResourceNotFoundException;

public class TopicByPublicUriNotFoundException extends ResourceNotFoundException {
    public TopicByPublicUriNotFoundException(String publicUri) {
        super("Topic not found: " + publicUri);
    }
}
