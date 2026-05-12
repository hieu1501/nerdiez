package com.tmb.csnerd.demo.exception.category;

import com.tmb.csnerd.demo.exception.ResourceNotFoundException;

public class CatergoryNotFound extends ResourceNotFoundException {
    public CatergoryNotFound(Long categoryId) {
        super("Category not found: " + categoryId);
    }
}
