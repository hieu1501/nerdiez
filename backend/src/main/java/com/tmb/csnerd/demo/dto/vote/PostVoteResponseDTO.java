package com.tmb.csnerd.demo.dto.vote;

import com.tmb.csnerd.demo.dto.post.PostVoteStatsDTO;

public record PostVoteResponseDTO(
    String categorySlug,
    String postSlugName,
    Byte userVote,
    PostVoteStatsDTO votes
) { }
