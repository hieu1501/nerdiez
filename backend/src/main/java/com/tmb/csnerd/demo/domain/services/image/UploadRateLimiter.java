package com.tmb.csnerd.demo.domain.services.image;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.tmb.csnerd.demo.exceptions.TooManyRequestsException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.atomic.AtomicInteger;

// Caps public uploads per user; each upload is a billed R2 write. In-memory, so it resets on restart.
@Component
public class UploadRateLimiter {
    private static final Duration WINDOW = Duration.ofHours(1);

    private final int maxPerWindow;
    private final Cache<String, AtomicInteger> counters = Caffeine.newBuilder()
            .expireAfterWrite(WINDOW)
            .build();

    public UploadRateLimiter(@Value("${app.upload.public.max-per-hour}") int maxPerWindow) {
        this.maxPerWindow = maxPerWindow;
    }

    public void acquire(Long userId) {
        long window = Instant.now().getEpochSecond() / WINDOW.toSeconds();
        AtomicInteger count = counters.get(userId + ":" + window, key -> new AtomicInteger());
        if (count.incrementAndGet() > maxPerWindow) {
            throw new TooManyRequestsException("Upload limit reached. Try again later.");
        }
    }
}
