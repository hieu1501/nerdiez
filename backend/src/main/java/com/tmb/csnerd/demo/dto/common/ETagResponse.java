package com.tmb.csnerd.demo.dto.common;

public record ETagResponse<T>(
    T content,
    String eTag
) {
    public static <T> ETagResponse<T> from(T content, String eTag) {
        return new ETagResponse<>(content, eTag);
    }
}
