package com.tmb.csnerd.demo.dto.common;
import org.springframework.data.domain.Page;

import java.util.List;

public record PageResponse<T>(
    List<T> items,
    int size,
    long offset,
    long totalItems,
    int totalPages,
    boolean hasNext,
    boolean hasPrevious
) {
    public static <T> PageResponse<T> from(Page<T> page) {
        return new PageResponse<>(
            page.getContent(),
            page.getSize(),
            page.getPageable().getOffset(),
            page.getTotalElements(),
            page.getTotalPages(),
            page.hasNext(),
            page.hasPrevious()
        );
    }
}
