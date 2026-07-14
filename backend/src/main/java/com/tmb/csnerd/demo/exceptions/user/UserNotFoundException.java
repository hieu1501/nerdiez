package com.tmb.csnerd.demo.exceptions.user;

import com.tmb.csnerd.demo.exceptions.ResourceNotFoundException;

public class UserNotFoundException extends ResourceNotFoundException {
    public UserNotFoundException(String subject) {
        super("User not found: " + subject);
    }
}
