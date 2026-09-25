package com.tmb.csnerd.demo.domain.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;

import java.net.URI;

@Configuration
public class R2ClientConfig {

    @Bean
    public S3Client s3Client(@Value("${cloudflare.r2.access-key-id}") String accessKeyId,
                              @Value("${cloudflare.r2.secret-access-key}") String secretAccessKey,
                              @Value("${cloudflare.r2.endpoint}") String endpoint) {
        return S3Client.builder()
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(accessKeyId, secretAccessKey)))
                .endpointOverride(URI.create(endpoint))
                .region(Region.of("auto"))
                .forcePathStyle(true)
                .build();
    }
}
