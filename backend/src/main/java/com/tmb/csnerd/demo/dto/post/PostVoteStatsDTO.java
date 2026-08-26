package com.tmb.csnerd.demo.dto.post;

import com.tmb.csnerd.demo.domain.models.Post;
import com.tmb.csnerd.demo.domain.services.fingerprint.IFingerprintData;

import java.time.Instant;

public record PostVoteStatsDTO(
    Long upvoteCount,
    Long downvoteCount,
    Long version
) {
    private record FingerprintData(
            String representation,
            Long version
    ) implements IFingerprintData {}

    public static PostVoteStatsDTO from(Long upvoteCount, Long downvoteCount, Long version) {
        return new PostVoteStatsDTO(upvoteCount, downvoteCount, version);
    }

    public IFingerprintData getFingerprintData() {
        return new FingerprintData("vote-stats", version);
    }
}