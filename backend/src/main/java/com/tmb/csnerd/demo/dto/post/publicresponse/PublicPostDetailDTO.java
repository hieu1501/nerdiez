package com.tmb.csnerd.demo.dto.post.publicresponse;

import com.tmb.csnerd.demo.dto.post.PostVoteStatsDTO;

public record PublicPostDetailDTO(
    PublicPostDetailContentDTO content,
    PostVoteStatsDTO voteStats,
    Byte userVote
) {
    public static PublicPostDetailDTO from(PublicPostDetailContentDTO content, PostVoteStatsDTO voteStats, Byte userVote) {
        return new PublicPostDetailDTO(content, voteStats, userVote);
    }
}