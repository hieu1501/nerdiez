package com.tmb.csnerd.demo.dto.post.publicresponse;

import com.tmb.csnerd.demo.dto.VoteStatsDTO;

public record PersonalPostBriefDTO(
    PersonalPostBriefContentDTO content,
    VoteStatsDTO voteStats
) {
    public static PersonalPostBriefDTO from(PersonalPostBriefContentDTO content, VoteStatsDTO voteStats) {
        return new PersonalPostBriefDTO(content, voteStats);
    }
}