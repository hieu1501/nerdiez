package com.tmb.csnerd.demo.utils;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.safety.Cleaner;
import org.jsoup.safety.Safelist;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Component
public class SanitizerUtils {
    private final Cleaner cleaner;
    private final Set<String> allowedHosts;

    public SanitizerUtils(@Value("${app.media.allowed-hosts}") List<String> allowedHosts) {
        Safelist safelist = Safelist.none()
                .addTags("p", "br", "strong", "em", "u", "s", "blockquote",
                        "ul", "ol", "li", "h1", "h2", "h3", "pre", "code", "hr",
                        "a", "img")
                .addAttributes("a", "href", "rel", "target")
                .addAttributes("img", "src", "alt", "title")
                .addAttributes("h1", "id", "style")
                .addAttributes("h2", "id", "style")
                .addAttributes("h3", "id", "style")
                .addAttributes("p", "style")
                .addProtocols("a", "href", "https", "http");
        cleaner = new Cleaner(safelist);
        this.allowedHosts = new HashSet<>(allowedHosts);
    }

    public String sanitizeHtmlDocument(Document document) {
        return cleaner.clean(document).toString();
    }

    public String sanitizeString(String content) {
        if (content == null || content.isBlank()) return null;
        return Jsoup.parse(content).text();
    }

    public boolean isAllowedMediaUrl(String url) {
        if (url == null || url.isBlank()) return false;
        try {
            URI u = URI.create(url.trim());
            if (!u.isAbsolute()) {
                return url.startsWith("/media/");
            }
            if (!"https".equalsIgnoreCase(u.getScheme())
                    && !"http".equalsIgnoreCase(u.getScheme())) {
                return false;
            }
            String host = u.getHost();
            if (host == null) return false;
            return allowedHosts.contains(host.toLowerCase());
        } catch (Exception e) {
            return false;
        }
    }

    public boolean isAllowedLink(String href) {
        // block javascript:, data:, vbscript:
        String lower = href.toLowerCase();
        if (lower.startsWith("javascript:") || lower.startsWith("data:")
                || lower.startsWith("vbscript:")) {
            return false;
        }
        try {
            URI u = URI.create(href);
            if (!u.isAbsolute()) return href.startsWith("/"); // internal paths only
            return "https".equalsIgnoreCase(u.getScheme());
        } catch (Exception e) {
            return false;
        }
    }
}
