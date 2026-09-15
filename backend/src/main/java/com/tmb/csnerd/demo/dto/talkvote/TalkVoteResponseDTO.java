package com.tmb.csnerd.demo.dto.talkvote;

import com.tmb.csnerd.demo.dto.VoteStatsDTO;

public record TalkVoteResponseDTO(
    String publicUri,
    Byte userVote,
    VoteStatsDTO votes
) { }
