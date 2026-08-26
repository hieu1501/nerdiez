package com.tmb.csnerd.demo.domain.repositories.post.projections;

public interface PostVotesInformationProjection {
    Long getPostId();
    Long getUpvoteCount();
    Long getDownvoteCount();
    Long getVoteVersion();
}
