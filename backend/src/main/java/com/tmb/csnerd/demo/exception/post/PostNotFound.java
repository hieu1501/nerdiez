package com.tmb.csnerd.demo.exception.post;

import com.tmb.csnerd.demo.exception.ResourceNotFoundException;

public class PostNotFound extends ResourceNotFoundException {
    public PostNotFound(Long postId) {
        super("Post not found: " + postId);
    }
}
