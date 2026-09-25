package com.tmb.csnerd.demo.domain.services.media;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.util.*;

@Component
public class MediaUtils {
    Logger logger = LoggerFactory.getLogger(MediaUtils.class);
    private final List<String> allowedExtensions;
    private final List<String> allowedUrlSchemes;
    private final List<String> allowedMediaSchemes;
    private final String r2PublicUrl;
    private final String r2PublicHost;

    public MediaUtils(@Value("${cloudflare.r2.public-url}") String r2PublicUrl,
                      @Value("${app.rule.allowed-image-extensions}") List<String> allowedExtensions,
                      @Value("${app.rule.allowed-media-schemes}") List<String> allowedMediaSchemes,
                      @Value("${app.rule.allowed-url-schemes}") List<String> allowedUrlSchemes) {
        this.r2PublicUrl = r2PublicUrl.endsWith("/") ? r2PublicUrl.substring(0, r2PublicUrl.length() - 1) : r2PublicUrl;
        this.r2PublicHost = URI.create(this.r2PublicUrl).getHost();
        this.allowedExtensions = allowedExtensions;
        this.allowedMediaSchemes = allowedMediaSchemes;
        this.allowedUrlSchemes = allowedUrlSchemes;
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

    public boolean isAllowedMediaUrl(String url) {
        if (url == null || url.isBlank()) return false;
        try {
            URI u = URI.create(url.trim());
            if (!u.isAbsolute()) return false;
            String scheme = u.getScheme().toLowerCase();
            if (!allowedMediaSchemes.contains(scheme)) return false;
            String host = u.getHost();
            if (host == null) return false;
            return host.equalsIgnoreCase(r2PublicHost);
        } catch (Exception e) {
            return false;
        }
    }

    public boolean isAllowedLink(String href) {
        try {
            URI u = URI.create(href.trim());
            String scheme = u.getScheme();
            if (scheme == null) return true; // Relative URLs
            scheme = scheme.toLowerCase();
            return allowedUrlSchemes.contains(scheme);
        } catch (Exception e) {
            return false;
        }
    }

    public String buildMediaUrl(String path) {
        if (path == null || path.isBlank()) return null;
        String normalizedPath = path.startsWith("/") ? path.substring(1) : path;
        return r2PublicUrl + "/" + normalizedPath;
    }

    public String extractImagePathFromUrl(String url) {
        if (url == null || url.isBlank()) return null;
        String trimmed = url.trim();
        String prefix = r2PublicUrl + "/";
        if (!trimmed.startsWith(prefix)) return null;
        String relativePath = trimmed.substring(prefix.length());
        if (!relativePath.isBlank() && !relativePath.contains("..")) return relativePath;
        return null;
    }
}
