package com.tmb.csnerd.demo.domain.services.publicuri;

import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;

// Root-relative so each client resolves it against the origin it reached the API through.
@Component
public class PublicResourceUriFactory {
    public String createPublicUri(String slug, String publicKey) {
        return slug + "~" + publicKey;
    }

    public URI post(String postUri, boolean forProfile) {
        return build(
                forProfile ? "/api/me/articles/{uri}" : "/api/articles/{uri}",
                postUri
        );
    }

    public URI talk(String talkUri, boolean forProfile) {
        return build(
                forProfile ? "/api/me/talks/{uri}" : "/api/talks/{uri}",
                talkUri
        );
    }

    public URI topic(String topicUri, boolean forProfile) {
        return build(
                forProfile ? "/api/me/topics/{uri}" : "/api/topics/{uri}",
                topicUri
        );
    }

    private URI build(String path, String publicUri) {
        validatePublicUri(publicUri);

        return UriComponentsBuilder.fromPath(path)
                .encode()
                .buildAndExpand(publicUri)
                .toUri();
    }

    private void validatePublicUri(String publicUri) {
        if (publicUri == null
                || publicUri.isBlank()
                || publicUri.contains("/")
                || publicUri.equals(".")
                || publicUri.equals("..")) {
            throw new IllegalArgumentException("publicUri must be a nonempty single path segment");
        }
    }
}
