package com.tmb.csnerd.demo.dto.post.publicresponse;

import com.tmb.csnerd.demo.dto.VoteStatsDTO;

public record PublicPostDetailDTO(
    PublicPostDetailContentDTO content,
    VoteStatsDTO voteStats,
    Byte userVote
) {
    public static PublicPostDetailDTO from(PublicPostDetailContentDTO content, VoteStatsDTO voteStats, Byte userVote) {
        return new PublicPostDetailDTO(content, voteStats, userVote);
    }
}