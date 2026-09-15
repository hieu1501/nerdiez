package com.tmb.csnerd.demo.domain.services.publicuri;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.net.URISyntaxException;

@Component
public class PublicResourceUriFactory {
    private static final String API_PATH = "api";

    private final String appScheme;
    private final String appHost;
    private final Integer appPort;
    private final URI baseUri;

    public PublicResourceUriFactory(@Value("${app.server.scheme}") String serverScheme,
                            @Value("${app.server.host}") String serverHost,
                            @Value("${app.server.port}") Integer serverPort) {
        this.appScheme = serverScheme;
        this.appHost = serverHost;
        this.appPort = serverPort;
        try {
            this.baseUri = new URI(appScheme, null, appHost, appPort, null, null, null);;
        } catch (URISyntaxException e) {
            throw new IllegalArgumentException("Illegal URI");
        }
    }

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

        return UriComponentsBuilder.fromUri(baseUri)
                .path(path)
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
