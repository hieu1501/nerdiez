package com.tmb.csnerd.demo.exceptions.post;

import com.tmb.csnerd.demo.exceptions.ResourceNotFoundException;

public class PostNotFound extends ResourceNotFoundException {
    public PostNotFound(Long postId) {
        super("Post not found: " + postId);
    }
}
