package com.tmb.csnerd.demo.utils;

import com.tmb.csnerd.demo.domain.services.image.ImageService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.util.List;
import java.util.Optional;

@Component
public class MediaUtils {
    private final List<String> allowedExtensions = List.of(".jpg", ".png", ".webp", ".jpeg");
    private final String appUrl;

    public MediaUtils(@Value("${app.url}") String appUrl) {
        this.appUrl = appUrl;
    }

    public String getExt(String filename) {
        return Optional.ofNullable(filename)
                .filter(n -> n.contains("."))
                .map(n -> n.substring(n.lastIndexOf('.')))
                .orElse("");
    }

    public Boolean extIsAllowed(String ext) {
        return allowedExtensions.contains(ext);
    }

    public String buildMediaUrl(String path) {
        if (path == null || path.isBlank()) return null;
        return appUrl + "/media/" + path;
    }

    public String extractImagePathFromUrl(String url) {
        if (url == null || url.isBlank()) return null;
        URI u = URI.create(url.trim());
        if (u.isAbsolute()) {
            String path = u.getPath();
            if (path.startsWith("/media/")){
                String relativePath = path.substring("/media/".length());
                if (!relativePath.isBlank() || !relativePath.contains("..")) return relativePath;
            }
        }
        else if (u.toString().startsWith("/media/")) {
            String relativePath = u.toString().substring("/media/".length());
            if (!relativePath.isBlank() || !relativePath.contains("..")) return relativePath;
        }
        return null;
    }
}
