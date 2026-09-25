package com.tmb.csnerd.demo.domain.services.auth;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.Map;

// Ends a user's Keycloak SSO sessions so the next login can't silently reuse them.
@Component
public class KeycloakSessionClient {
    private static final Logger log = LoggerFactory.getLogger(KeycloakSessionClient.class);

    private final RestClient restClient;
    private final String clientId;
    private final String clientSecret;

    public KeycloakSessionClient(
            @Value("${keycloak.url}") String keycloakUrl,
            @Value("${spring.security.oauth2.client.registration.keycloak.client-id}") String clientId,
            @Value("${spring.security.oauth2.client.registration.keycloak.client-secret}") String clientSecret) {
        this.restClient = RestClient.builder().baseUrl(keycloakUrl).build();
        this.clientId = clientId;
        this.clientSecret = clientSecret;
    }

    // Local tokens are already revoked, so a Keycloak failure shouldn't fail the logout.
    public void logoutAllSessions(String keycloakUserId) {
        try {
            restClient.post()
                    .uri("/admin/realms/nerdiez/users/{id}/logout", keycloakUserId)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + fetchServiceToken())
                    .retrieve()
                    .toBodilessEntity();
        } catch (RestClientException e) {
            log.warn("Failed to end Keycloak sessions for user {}", keycloakUserId, e);
        }
    }

    private String fetchServiceToken() {
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("grant_type", "client_credentials");
        form.add("client_id", clientId);
        form.add("client_secret", clientSecret);
        Map<?, ?> body = restClient.post()
                .uri("/realms/nerdiez/protocol/openid-connect/token")
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(form)
                .retrieve()
                .body(Map.class);
        if (body == null || !(body.get("access_token") instanceof String token)) {
            throw new RestClientException("Keycloak token response has no access_token");
        }
        return token;
    }
}
