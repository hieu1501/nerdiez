package com.tmb.csnerd.demo.dto.post.publicresponse;

import com.tmb.csnerd.demo.dto.VoteStatsDTO;
import com.tmb.csnerd.demo.dto.post.adminresponse.AdminPostDetailContentDTO;

public record PersonalPostDetailDTO(
    PersonalPostDetailContentDTO content,
    VoteStatsDTO voteStats
) {
    public static PersonalPostDetailDTO from(PersonalPostDetailContentDTO content, VoteStatsDTO voteStats) {
        return new PersonalPostDetailDTO(content, voteStats);
    }
}