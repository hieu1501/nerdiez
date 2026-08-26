package com.tmb.csnerd.demo.dto.post.adminresponse;

import com.tmb.csnerd.demo.dto.post.PostVoteStatsDTO;
import com.tmb.csnerd.demo.dto.post.publicresponse.PublicPostDetailContentDTO;

public record AdminPostDetailDTO(
    AdminPostDetailContentDTO content,
    PostVoteStatsDTO voteStats
) {
    public static AdminPostDetailDTO from(AdminPostDetailContentDTO content, PostVoteStatsDTO voteStats) {
        return new AdminPostDetailDTO(content, voteStats);
    }
}