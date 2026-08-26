package com.tmb.csnerd.demo.exceptions.category;

import com.tmb.csnerd.demo.exceptions.ResourceNotFoundException;

public class CategoryByNameNotFoundException extends ResourceNotFoundException {
    public CategoryByNameNotFoundException(String categoryName) {
        super("Category not found: " + categoryName);
    }
}
