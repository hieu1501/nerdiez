package com.tmb.csnerd.demo.services.category;

import com.tmb.csnerd.demo.repositories.CategoryRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@AllArgsConstructor
@Service
public class CategoryQueryService {
    private final CategoryRepository categoryRepository;
}
