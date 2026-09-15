package com.tmb.csnerd.demo.dto.post.publicresponse;

import com.tmb.csnerd.demo.dto.VoteStatsDTO;

public record PublicPostBriefDTO(
    PublicPostBriefContentDTO content,
    VoteStatsDTO voteStats
) {
    public static PublicPostBriefDTO from(PublicPostBriefContentDTO content, VoteStatsDTO voteStats) {
        return new PublicPostBriefDTO(content, voteStats);
    }
}
