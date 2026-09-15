package com.tmb.csnerd.demo.exceptions.post;

import com.tmb.csnerd.demo.exceptions.ResourceNotFoundException;

public class PostByPublicUriNotFoundException extends ResourceNotFoundException {
    public PostByPublicUriNotFoundException(String publicUri) {
        super("Post not found for uri: "  + publicUri);
    }
}
