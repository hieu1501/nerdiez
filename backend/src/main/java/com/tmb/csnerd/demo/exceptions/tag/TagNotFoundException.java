package com.tmb.csnerd.demo.exceptions.tag;

import com.tmb.csnerd.demo.exceptions.ResourceNotFoundException;

public class TagNotFoundException extends ResourceNotFoundException {
    public TagNotFoundException(Long tagId) {
        super("Tag not found: " + tagId);
    }
}
