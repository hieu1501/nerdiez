package com.tmb.csnerd.demo.dto.talk.adminresponse;

import com.tmb.csnerd.demo.domain.models.Talk;
import com.tmb.csnerd.demo.domain.services.fingerprint.IFingerprintData;
import com.tmb.csnerd.demo.dto.topic.adminresponse.TopicAdminRefDTO;
import com.tmb.csnerd.demo.dto.user.UserRefDTO;

import java.net.URI;
import java.time.Instant;

public record AdminTalkContentDTO(
    Long id,
    String content,
    UserRefDTO author,
    TopicAdminRefDTO topic,
    Instant createdAt,
    Instant updatedAt,
    Boolean isActive,
    URI canonicalUri
) {
    private record FingerprintData(
        String representation,
        Long id,
        Instant updatedAt,
        UserRefDTO author,
        TopicAdminRefDTO topic,
        String canonicalUri
    ) implements IFingerprintData { }

    public static AdminTalkContentDTO from(Talk talk, String content, URI canonicalUri) {
        return new AdminTalkContentDTO(
                talk.getId(),
                content,
                UserRefDTO.from(talk.getAuthor()),
                TopicAdminRefDTO.from(talk.getTopic()),
                talk.getCreatedAt(),
                talk.getUpdatedAt(),
                talk.getIsActive(),
                canonicalUri
        );
    }

    public IFingerprintData getFingerprintData() {
        return new FingerprintData("admin-talk-detail", id, updatedAt, author, topic, canonicalUri.toString());
    }
}
