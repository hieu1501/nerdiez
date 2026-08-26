package com.tmb.csnerd.demo.exceptions.post;

import com.tmb.csnerd.demo.exceptions.ResourceNotFoundException;

public class PostByNameNotFoundException extends ResourceNotFoundException {
    public PostByNameNotFoundException(String postName) {
        super("Post not found: " + postName);
    }
}
