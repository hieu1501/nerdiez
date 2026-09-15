package com.tmb.csnerd.demo.exceptions.talk;

import com.tmb.csnerd.demo.exceptions.ResourceNotFoundException;

public class TalkByIdNotFoundException extends ResourceNotFoundException {
    public TalkByIdNotFoundException(Long id) {
        super("Talk not found: " + id);
    }
}
