package com.tmb.csnerd.demo.exceptions.talk;

import com.tmb.csnerd.demo.exceptions.ResourceNotFoundException;

public class TalkByPublicUriNotFoundException extends ResourceNotFoundException {
    public TalkByPublicUriNotFoundException(String publicUri) {
        super("Talk not found for uri: "  + publicUri);
    }
}
