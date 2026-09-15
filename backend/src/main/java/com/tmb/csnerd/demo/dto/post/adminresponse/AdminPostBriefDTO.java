package com.tmb.csnerd.demo.dto.post.adminresponse;

import com.tmb.csnerd.demo.dto.VoteStatsDTO;

public record AdminPostBriefDTO(
    AdminPostBriefContentDTO content,
    VoteStatsDTO voteStats
) {
    public static AdminPostBriefDTO from(AdminPostBriefContentDTO content, VoteStatsDTO voteStats) {
        return new AdminPostBriefDTO(content, voteStats);
    }
}