package com.tmb.csnerd.demo.domain.repositories.talkvote.projections;

public interface TalkVotesInformationProjection {
    Long getTalkId();
    Long getUpvoteCount();
    Long getDownvoteCount();
    Long getVoteVersion();
}
