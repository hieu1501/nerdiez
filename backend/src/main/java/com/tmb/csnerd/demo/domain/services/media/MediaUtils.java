package com.tmb.csnerd.demo.domain.services.media;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.*;

@Component
public class MediaUtils {
    Logger logger = LoggerFactory.getLogger(MediaUtils.class);
    private final List<String> allowedExtensions;
    private final List<String> allowedMediaHosts;
    private final List<String> allowedUrlSchemes;
    private final List<String> allowedMediaSchemes;
    private final String appScheme;
    private final String appHost;
    private final Integer appPort;

    public MediaUtils(@Value("${app.server.scheme}") String serverScheme,
                      @Value("${app.server.host}") String serverHost,
                      @Value("${app.server.port}") Integer serverPort,
                      @Value("${app.rule.allowed-image-extensions}") List<String> allowedExtensions,
                      @Value("${app.rule.allowed-media-hosts}") List<String> allowedMediaHosts,
                      @Value("${app.rule.allowed-media-schemes}") List<String> allowedMediaSchemes,
                      @Value("${app.rule.allowed-url-schemes}") List<String> allowedUrlSchemes) {
        this.appScheme = serverScheme;
        this.appHost = serverHost;
        this.appPort = serverPort;
        this.allowedExtensions = allowedExtensions;
        this.allowedMediaHosts = allowedMediaHosts;
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
            if (!u.isAbsolute()) return url.startsWith("/media/");
            String scheme = u.getScheme().toLowerCase();
            if (!allowedMediaSchemes.contains(scheme)) return false;
            String host = u.getHost();
            if (host == null) return false;
            return allowedMediaHosts.contains(host.toLowerCase());
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
        String mediaUrl = null;
        if (path == null || path.isBlank()) return mediaUrl;
        try {
            URI uri = new URI(appScheme, null, appHost, appPort, "/media/" + path, null, null);
            mediaUrl = uri.toString();
        } catch (URISyntaxException e) {
            logger.error(e.getMessage(), e);
        }
        return mediaUrl;
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
