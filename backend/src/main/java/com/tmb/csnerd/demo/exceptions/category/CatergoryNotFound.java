package com.tmb.csnerd.demo.exceptions.category;

import com.tmb.csnerd.demo.exceptions.ResourceNotFoundException;

public class CatergoryNotFound extends ResourceNotFoundException {
    public CatergoryNotFound(Long categoryId) {
        super("Category not found: " + categoryId);
    }
}
