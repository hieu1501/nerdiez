package com.tmb.csnerd.demo.utils;

import com.tmb.csnerd.demo.domain.services.media.MediaUtils;
import org.commonmark.node.AbstractVisitor;
import org.commonmark.node.Image;
import org.commonmark.node.Link;
import org.commonmark.node.Node;
import org.commonmark.node.SourceSpan;
import org.commonmark.parser.IncludeSourceSpans;
import org.commonmark.parser.Parser;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Component
public class MarkdownUtils {
    // Source spans let us patch image URLs in place; re-rendering would reformat the author's text.
    private final Parser parser = Parser.builder().includeSourceSpans(IncludeSourceSpans.BLOCKS_AND_INLINES).build();

    private final MediaUtils mediaUtils;

    public MarkdownUtils(MediaUtils mediaUtils) {
        this.mediaUtils = mediaUtils;
    }

    public String normalizeMarkdownAndExtractImageUrls(String content, List<String> imagePaths) {
        Node document = parseDocument(content);
        List<String> errors = new ArrayList<>();
        List<Replacement> replacements = new ArrayList<>();
        document.accept(new AbstractVisitor() {
            @Override
            public void visit(Link link) {
                String url = normalizeUrl(link.getDestination(), "link", errors);
                if (!errors.isEmpty()) {
                    throw new IllegalArgumentException(String.join("; ", errors));
                }
                link.setDestination(url);
                super.visit(link);
            }

            @Override
            public void visit(Image image) {
                String url = normalizeUrl(image.getDestination(), "image", errors);
                if (!errors.isEmpty()) {
                    throw new IllegalArgumentException(String.join("; ", errors));
                }
                Replacement replacement = replaceDestination(content, image, url);
                if (replacement == null) {
                    throw new IllegalArgumentException("Reference-style images are not supported");
                }
                replacements.add(replacement);
                imagePaths.add(url.split("[?#]")[0]); // Don't store queries and fragments to database
                super.visit(image);
            }
        });
        return applyReplacements(content, replacements);
    }

    public String denormalizeImageUrlsInContent(String content) {
        Node document = parseDocument(content);
        List<Replacement> replacements = new ArrayList<>();
        document.accept(new AbstractVisitor() {
            @Override
            public void visit(Image image) {
                String url = denormalizeUrl(image.getDestination(), "image");
                Replacement replacement = url != null
                        ? replaceDestination(content, image, url)
                        : new Replacement(spanStart(image), spanEnd(image), "");
                if (replacement != null) {
                    replacements.add(replacement);
                }
            }
        });
        return applyReplacements(content, replacements);
    }

    public List<String> extractImagePathsInContent(String content) {
        List<String> imagePaths = new ArrayList<>();
        Node document = parseDocument(content);
        document.accept(new AbstractVisitor() {
            @Override
            public void visit(Image image) {
                imagePaths.add(image.getDestination());
                super.visit(image);
            }
        });
        return imagePaths;
    }

    private Node parseDocument(String document) {
        return parser.parse(document);
    }

    private record Replacement(int start, int end, String text) {}

    // Rewrites the "(url "title")" part of an inline image; returns null for reference-style images.
    private Replacement replaceDestination(String content, Image image, String url) {
        Node lastChild = image.getLastChild();
        int labelEnd = lastChild != null ? spanEnd(lastChild) : spanStart(image) + 2;
        int end = spanEnd(image);
        if (!content.startsWith("](", labelEnd) || content.charAt(end - 1) != ')') {
            return null;
        }
        String destination = url.matches(".*[\\s()<>].*") ? "<" + url + ">" : url;
        String title = image.getTitle() == null || image.getTitle().isEmpty() ? ""
                : " \"" + image.getTitle().replace("\\", "\\\\").replace("\"", "\\\"") + "\"";
        return new Replacement(labelEnd + 1, end, "(" + destination + title + ")");
    }

    private static int spanStart(Node node) {
        return node.getSourceSpans().getFirst().getInputIndex();
    }

    private static int spanEnd(Node node) {
        SourceSpan last = node.getSourceSpans().getLast();
        return last.getInputIndex() + last.getLength();
    }

    // Applies from the end so earlier offsets stay valid.
    private static String applyReplacements(String content, List<Replacement> replacements) {
        StringBuilder result = new StringBuilder(content);
        replacements.stream()
                .sorted(Comparator.comparingInt(Replacement::start).reversed())
                .forEach(replacement -> result.replace(replacement.start(), replacement.end(), replacement.text()));
        return result.toString();
    }

    // Remove all root path from image links
    private String normalizeUrl(String value, String type, List<String> errors) {
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

    // Changing all image paths to absolute paths
    private String denormalizeUrl(String value, String type) {
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
