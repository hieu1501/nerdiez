package com.tmb.csnerd.demo.utils;

import org.commonmark.node.AbstractVisitor;
import org.commonmark.node.Image;
import org.commonmark.node.Link;
import org.commonmark.node.Node;
import org.commonmark.parser.Parser;
import org.commonmark.renderer.markdown.MarkdownRenderer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Component
public class MarkdownUtils {
    private final Parser parser = Parser.builder().build();
    private final MarkdownRenderer renderer = MarkdownRenderer.builder().build();

    private final MediaUtils mediaUtils;

    public MarkdownUtils(@Value("${app.rule.allowed-media-hosts}") List<String> allowedMediaHosts,
                                       @Value("${app.rule.allowed-media-schemes}") List<String> allowedMediaSchemes,
                                       @Value("${app.rule.allowed-url-schemes}") List<String> allowedUrlSchemes,
                                       MediaUtils mediaUtils) {
        this.mediaUtils = mediaUtils;
    }

    public Node parseDocument(String document) {
        return parser.parse(document);
    }

    public String renderDocument(Node node) {
        return renderer.render(node);
    }

    public String denormalize(String input) {
        Node document = parser.parse(input);

        document.accept(new AbstractVisitor() {
            @Override
            public void visit(Image image) {
                String url = denormalizeUrl(image.getDestination(), "image");
                image.setDestination(url);
                super.visit(image);
            }
        });
        return renderer.render(document);
    }

    public String normalizeUrl(String value, String type, List<String> errors) {
        if (value == null || value.isBlank()) {
            errors.add("Url is blank");
            return value;
        }
        try {
            switch (type) {
                case "image":
                    if (!mediaUtils.isAllowedMediaUrl(value)) {
                        errors.add("Url %s is invalid ".formatted(value));
                        return value;
                    }
                    // Parsing image url from absolute path to normalized path for storing
                    URI uri = URI.create(value);
                    if (uri.isAbsolute()) {
                        String path = uri.getRawPath();
                        String query = uri.getRawQuery();
                        String fragment = uri.getRawFragment();
                        if (path == null || path.isBlank()) {
                            errors.add("Url %s is invalid ".formatted(value));
                            return value;
                        }
                        String[] parts = path.split("/");
                        path = parts[parts.length - 1]; // Get only the name of file
                        StringBuilder normalizedPath = new StringBuilder();
                        normalizedPath.append(path);
                        if (query != null) {
                            normalizedPath.append("?").append(query);
                        }
                        if (fragment != null) {
                            normalizedPath.append("#").append(fragment);
                        }
                        value = normalizedPath.toString();
                    }
                    break;
                case "link":
                    if (!mediaUtils.isAllowedLink(value)) {
                        errors.add("Url %s is invalid ".formatted(value));
                        return value;
                    }
                    break;
            }
        } catch (IllegalArgumentException e) {
            errors.add(type + " URL is invalid: " + value);
        }
        return value;
    }

    public String denormalizeUrl(String value, String type) {
        if (value == null || value.isBlank()) {
            return null;
        }
        switch (type) {
            case "image":
                URI uri = URI.create(value);
                if (!uri.isAbsolute()) {
                    String path = mediaUtils.buildMediaUrl(uri.getRawPath());
                    if (path == null || path.isBlank()) return null;
                    String query = uri.getRawQuery();
                    String fragment = uri.getRawFragment();
                    StringBuilder denormalizedPath = new StringBuilder();
                    denormalizedPath.append(path);
                    if (query != null) {
                        denormalizedPath.append("?").append(query);
                    }
                    if (fragment != null) {
                        denormalizedPath.append("#").append(fragment);
                    }
                    value = denormalizedPath.toString();
                }
                break;
        }
        return value;
    }
}
