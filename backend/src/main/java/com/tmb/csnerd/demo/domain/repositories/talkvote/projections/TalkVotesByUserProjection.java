package com.tmb.csnerd.demo.domain.repositories.talkvote.projections;

public interface TalkVotesByUserProjection {
    Long getTalkId();
    Byte getVote();
}
