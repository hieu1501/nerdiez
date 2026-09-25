package com.tmb.csnerd.demo.domain.security;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.DefaultOAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

public class KeycloakIdpHintResolver implements OAuth2AuthorizationRequestResolver {
    private static final Set<String> ALLOWED_PROMPTS = Set.of("login", "select_account");

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
        String prompt = request.getParameter("prompt");
        boolean hasPrompt = prompt != null && ALLOWED_PROMPTS.contains(prompt); // Set.of rejects null lookups
        if (idp == null && !hasPrompt) return req; // fall back to Keycloak's own login page
        Map<String, Object> params = new HashMap<>(req.getAdditionalParameters());
        if (idp != null) params.put("kc_idp_hint", idp);
        // Keycloak forwards prompt to Google/GitHub, so the user can pick a different account there
        if (hasPrompt) params.put("prompt", prompt);
        return OAuth2AuthorizationRequest.from(req)
                .additionalParameters(params)
                .build();
    }
}

