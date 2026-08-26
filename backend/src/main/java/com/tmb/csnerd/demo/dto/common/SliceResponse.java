package com.tmb.csnerd.demo.dto.common;
import org.springframework.data.domain.Slice;

import java.util.List;

public record SliceResponse<T>(
    List<T> items,
    int size,
    long offset,
    boolean hasNext,
    boolean hasPrevious
) {
    public static <T> SliceResponse<T> from(Slice<T> slice) {
        return new SliceResponse<>(
            slice.getContent(),
            slice.getSize(),
            slice.getPageable().getOffset(),
            slice.hasNext(),
            slice.hasPrevious()
        );
    }
}
