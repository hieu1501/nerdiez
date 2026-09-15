package com.tmb.csnerd.demo.domain.services.publicuri;

import org.springframework.stereotype.Component;

import java.security.SecureRandom;

@Component
public class PublicKeyGenerator {
    public static final int KEY_LENGTH = 12;
    private static final char[] ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".toCharArray();
    private final SecureRandom random = new SecureRandom();

    public String generate() {
        char[] result = new char[KEY_LENGTH];
        for (int i = 0; i < KEY_LENGTH; i++) {
            result[i] = ALPHABET[random.nextInt(ALPHABET.length)];
        }
        return new String(result);
    }
}
