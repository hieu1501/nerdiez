package com.tmb.csnerd.demo.exceptions.post;

import com.tmb.csnerd.demo.exceptions.ResourceNotFoundException;

public class PostByNameNotMatchCategoryException extends ResourceNotFoundException {
    public PostByNameNotMatchCategoryException(String postName, String category) {
        super("Post not found " + postName + " for category " + category);
    }
}
