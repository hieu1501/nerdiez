package com.tmb.csnerd.demo.dto;

import com.tmb.csnerd.demo.domain.services.fingerprint.IFingerprintData;

public record VoteStatsDTO(
    Long upvoteCount,
    Long downvoteCount,
    Long version
) {
    private record FingerprintData(
            String representation,
            Long version
    ) implements IFingerprintData {}

    public static VoteStatsDTO from(Long upvoteCount, Long downvoteCount, Long version) {
        return new VoteStatsDTO(upvoteCount, downvoteCount, version);
    }

    public IFingerprintData getFingerprintData() {
        return new FingerprintData("vote-stats", version);
    }
}