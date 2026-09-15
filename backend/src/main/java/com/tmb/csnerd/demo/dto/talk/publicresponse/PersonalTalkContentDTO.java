package com.tmb.csnerd.demo.dto.talk.publicresponse;

import com.tmb.csnerd.demo.domain.models.Talk;
import com.tmb.csnerd.demo.domain.services.fingerprint.IFingerprintData;
import com.tmb.csnerd.demo.dto.topic.publicresponse.TopicPublicRefDTO;

import java.net.URI;
import java.time.Instant;

public record PersonalTalkContentDTO(
    String content,
    TopicPublicRefDTO topic,
    Instant createdAt,
    Instant updatedAt,
    Boolean isActive,
    URI canonicalUri
) {
    private record FingerprintData(
            String representation,
            Instant updatedAt,
            TopicPublicRefDTO topic,
            String canonicalUri
    ) implements IFingerprintData { }

    public static PersonalTalkContentDTO from(Talk talk, String content, URI canonicalUri) {
        return new PersonalTalkContentDTO(
                content,
                TopicPublicRefDTO.from(talk.getTopic()),
                talk.getCreatedAt(),
                talk.getUpdatedAt(),
                talk.getIsActive(),
                canonicalUri
        );
    }

    public IFingerprintData getFingerprintData() {
        return new FingerprintData("profile-talk-detail", updatedAt, topic, canonicalUri.toString());
    }
}
