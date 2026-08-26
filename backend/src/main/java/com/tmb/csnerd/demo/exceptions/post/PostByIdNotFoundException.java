package com.tmb.csnerd.demo.exceptions.post;

import com.tmb.csnerd.demo.exceptions.ResourceNotFoundException;

public class PostByIdNotFoundException extends ResourceNotFoundException {
    public PostByIdNotFoundException(Long postId) {
        super("Post not found: " + postId);
    }
}
