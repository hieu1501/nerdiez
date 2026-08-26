package com.tmb.csnerd.demo.utils;

import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;

@Component
public class ETagFactory {
    public String weakETag(String... components) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");

            String source = String.join("|", components);
            byte[] hash = digest.digest(source.getBytes(StandardCharsets.UTF_8));

            String token = Base64.getUrlEncoder()
                    .withoutPadding()
                    .encodeToString(hash);

            return "W/\"" + token + "\"";
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException(exception);
        }
    }
}
