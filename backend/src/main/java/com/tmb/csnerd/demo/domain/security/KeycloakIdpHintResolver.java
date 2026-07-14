package com.tmb.csnerd.demo.domain.security;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.DefaultOAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

public class KeycloakIdpHintResolver implements OAuth2AuthorizationRequestResolver {
    private final OAuth2AuthorizationRequestResolver defaultResolver;

    public KeycloakIdpHintResolver(ClientRegistrationRepository clientRegistrationRepository, String authorizationRequestBaseUri) {
        this.defaultResolver = new DefaultOAuth2AuthorizationRequestResolver(clientRegistrationRepository, authorizationRequestBaseUri);
    }

    @Override
    public OAuth2AuthorizationRequest resolve(HttpServletRequest request) {
        return customize(request, defaultResolver.resolve(request));
    }

    @Override
    public OAuth2AuthorizationRequest resolve(HttpServletRequest request, String registrationId) {
        return customize(request, defaultResolver.resolve(request, registrationId));
    }

    private OAuth2AuthorizationRequest customize(HttpServletRequest request, OAuth2AuthorizationRequest req) {
        if (req == null) return null;

        String idp = request.getParameter("idp"); // "google" or "github"
        if (idp == null) return req; // fall back to Keycloak's own login page
        Map<String, Object> params = new HashMap<>(req.getAdditionalParameters());
        params.put("kc_idp_hint", idp);
        OAuth2AuthorizationRequest.Builder builder = OAuth2AuthorizationRequest.from(req)
                .additionalParameters(params);

        String redirectUri = request.getParameter("redirect_uri");
        if (redirectUri != null) {
            // Encode our custom data into the state param, alongside Spring's own CSRF value
            String customState = req.getState() + "|" + Base64.getUrlEncoder()
                    .encodeToString(redirectUri.getBytes(StandardCharsets.UTF_8));
            builder.state(customState);
        }
        return builder.build();
    }
}

