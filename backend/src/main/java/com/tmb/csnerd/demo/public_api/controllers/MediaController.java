package com.tmb.csnerd.demo.public_api.controllers;

import com.tmb.csnerd.demo.domain.services.media.MediaUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Duration;

@RestController
@RequestMapping("/media")
public class MediaController {
    private final Path root;
    private final MediaUtils mediaUtils;

    public MediaController(@Value("${app.upload.dir}") String uploadDir, MediaUtils mediaUtils) {
        this.root = Paths.get(uploadDir).toAbsolutePath().normalize();
        this.mediaUtils = mediaUtils;
    }

    @GetMapping("/{filepath}")
    public ResponseEntity<Resource> get(@PathVariable String filepath) throws IOException {
        Path file = root.resolve(filepath).normalize();
        if (!file.startsWith(root) || !Files.exists(file)) {
            return ResponseEntity.notFound().build();
        }
        String ext = mediaUtils.getExt(filepath);
        if (!mediaUtils.extIsAllowed(ext)) {
            throw new IllegalArgumentException("File type not supported: " + ext);
        }

        Resource resource = new UrlResource(file.toUri());
        String contentType = Files.probeContentType(file);
        if (contentType == null) contentType = "application/octet-stream";

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .cacheControl(CacheControl.maxAge(Duration.ofDays(365)).cachePublic().immutable())
                .body(resource);
    }
}
