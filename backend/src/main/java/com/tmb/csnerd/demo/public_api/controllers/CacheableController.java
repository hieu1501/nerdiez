package com.tmb.csnerd.demo.public_api.controllers;

import org.springframework.util.DigestUtils;

import java.nio.charset.StandardCharsets;

public interface CacheableController {
    default String buildETag(String content) {
        return "\"" + DigestUtils.md5DigestAsHex(content.getBytes(StandardCharsets.UTF_8)) + "\"";
    }
}
