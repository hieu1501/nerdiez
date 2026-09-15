package com.tmb.csnerd.demo.dto.talk.publicresponse;

import com.tmb.csnerd.demo.domain.models.Talk;
import com.tmb.csnerd.demo.domain.services.fingerprint.IFingerprintData;
import com.tmb.csnerd.demo.dto.topic.publicresponse.TopicPublicRefDTO;
import com.tmb.csnerd.demo.dto.user.UserRefDTO;

import java.net.URI;
import java.time.Instant;

public record PublicTalkContentDTO(
    String content,
    UserRefDTO author,
    TopicPublicRefDTO topic,
    Instant createdAt,
    Instant updatedAt,
    URI canonicalUri
) {
    private record FingerprintData(
            String representation,
            Instant updatedAt,
            UserRefDTO author,
            TopicPublicRefDTO topic,
            String canonicalUri
    ) implements IFingerprintData { }

    public static PublicTalkContentDTO from(Talk talk, String content, URI canonicalUri) {
        return new PublicTalkContentDTO(
                content,
                UserRefDTO.from(talk.getAuthor()),
                TopicPublicRefDTO.from(talk.getTopic()),
                talk.getCreatedAt(),
                talk.getUpdatedAt(),
                canonicalUri
        );
    }

    public IFingerprintData getFingerprintData() {
        return new FingerprintData("public-talk-detail", updatedAt, author, topic, canonicalUri.toString());
    }
}
