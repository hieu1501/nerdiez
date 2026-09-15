package com.tmb.csnerd.demo.dto.postvote;

import com.tmb.csnerd.demo.dto.VoteStatsDTO;

public record PostVoteResponseDTO(
    String publicUri,
    Byte userVote,
    VoteStatsDTO votes
) { }
