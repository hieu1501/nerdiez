package com.tmb.csnerd.demo.dto.common;

public record CachedContent<T> (
    T content,
    String fingerprint
) {
}
