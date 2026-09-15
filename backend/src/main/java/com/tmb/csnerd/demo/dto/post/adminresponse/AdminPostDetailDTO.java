package com.tmb.csnerd.demo.dto.post.adminresponse;

import com.tmb.csnerd.demo.dto.VoteStatsDTO;

public record AdminPostDetailDTO(
    AdminPostDetailContentDTO content,
    VoteStatsDTO voteStats
) {
    public static AdminPostDetailDTO from(AdminPostDetailContentDTO content, VoteStatsDTO voteStats) {
        return new AdminPostDetailDTO(content, voteStats);
    }
}