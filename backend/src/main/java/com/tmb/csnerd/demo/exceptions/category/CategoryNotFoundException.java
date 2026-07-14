package com.tmb.csnerd.demo.exceptions.category;

import com.tmb.csnerd.demo.exceptions.ResourceNotFoundException;

public class CategoryNotFoundException extends ResourceNotFoundException {
    public CategoryNotFoundException(Long categoryId) {
        super("Category not found: " + categoryId);
    }
}
