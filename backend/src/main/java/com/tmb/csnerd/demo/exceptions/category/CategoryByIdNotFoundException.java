package com.tmb.csnerd.demo.exceptions.category;

import com.tmb.csnerd.demo.exceptions.ResourceNotFoundException;

public class CategoryByIdNotFoundException extends ResourceNotFoundException {
    public CategoryByIdNotFoundException(Long categoryId) {
        super("Category not found: " + categoryId);
    }
}
