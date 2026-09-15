package com.tmb.csnerd.demo.dto.talk.publicresponse;

import com.tmb.csnerd.demo.dto.VoteStatsDTO;

public record PublicTalkDTO(
    PublicTalkContentDTO content,
    VoteStatsDTO voteStats,
    Byte userVote
) { }
