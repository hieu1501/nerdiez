package com.tmb.csnerd.demo.dto.talk.adminresponse;

import com.tmb.csnerd.demo.dto.VoteStatsDTO;

public record AdminTalkDTO(AdminTalkContentDTO content, VoteStatsDTO voteStats) { }
