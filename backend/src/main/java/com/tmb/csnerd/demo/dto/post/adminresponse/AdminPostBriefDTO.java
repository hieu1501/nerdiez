package com.tmb.csnerd.demo.dto.post.adminresponse;

import com.tmb.csnerd.demo.dto.post.PostVoteStatsDTO;
import com.tmb.csnerd.demo.dto.post.publicresponse.PublicPostBriefContentDTO;

public record AdminPostBriefDTO(
    AdminPostBriefContentDTO content,
    PostVoteStatsDTO voteStats
) {
    public static AdminPostBriefDTO from(AdminPostBriefContentDTO content, PostVoteStatsDTO voteStats) {
        return new AdminPostBriefDTO(content, voteStats);
    }
}