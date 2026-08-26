package com.tmb.csnerd.demo.dto.post.publicresponse;

import com.tmb.csnerd.demo.domain.models.Post;
import com.tmb.csnerd.demo.dto.category.publicresponse.CategoryPublicRefDTO;
import com.tmb.csnerd.demo.dto.post.PostVoteStatsDTO;
import com.tmb.csnerd.demo.dto.topic.publicresponse.TopicPublicRefDTO;

import java.time.Instant;
import java.util.Set;
import java.util.stream.Collectors;

public record PublicPostBriefDTO(
    PublicPostBriefContentDTO content,
    PostVoteStatsDTO voteStats
) {
    public static PublicPostBriefDTO from(PublicPostBriefContentDTO content, PostVoteStatsDTO voteStats) {
        return new PublicPostBriefDTO(content, voteStats);
    }
}