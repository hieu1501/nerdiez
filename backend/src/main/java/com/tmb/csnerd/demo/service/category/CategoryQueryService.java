package com.tmb.csnerd.demo.service.category;

import com.tmb.csnerd.demo.repository.CategoryRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@AllArgsConstructor
@Service
public class CategoryQueryService {
    private final CategoryRepository categoryRepository;
}
