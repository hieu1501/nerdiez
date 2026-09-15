package com.tmb.csnerd.demo.domain.repositories.postvote.projections;

public interface PostVotesInformationProjection {
    Long getPostId();
    Long getUpvoteCount();
    Long getDownvoteCount();
    Long getVoteVersion();
}
