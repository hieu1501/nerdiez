package com.tmb.csnerd.demo.domain.services.fingerprint;

import org.springframework.stereotype.Component;
import tools.jackson.databind.MapperFeature;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.ObjectWriter;
import tools.jackson.databind.SerializationFeature;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;

@Component
public class FingerprintService {
    private final ObjectWriter writer;

    public FingerprintService(ObjectMapper objectMapper) {
        ObjectMapper fingerprintMapper = objectMapper.rebuild()
                .enable(MapperFeature.SORT_PROPERTIES_ALPHABETICALLY)
                .enable(SerializationFeature.ORDER_MAP_ENTRIES_BY_KEYS)
                .build();

        this.writer = fingerprintMapper.writer();
    }

    public String fingerprint(IFingerprintData value) {
        try {
            byte[] canonicalBytes = writer.writeValueAsBytes(value);

            byte[] digest = MessageDigest
                    .getInstance("SHA-256")
                    .digest(canonicalBytes);

            return Base64.getUrlEncoder()
                    .withoutPadding()
                    .encodeToString(digest);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException(exception);
        }
    }
}
