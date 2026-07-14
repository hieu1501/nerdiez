package com.tmb.csnerd.demo.exceptions.post;

import com.tmb.csnerd.demo.exceptions.ResourceNotFoundException;

public class PostNotFoundException extends ResourceNotFoundException {
    public PostNotFoundException(Long postId) {
        super("Post not found: " + postId);
    }
}
