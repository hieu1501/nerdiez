package com.tmb.csnerd.demo.domain.services.vote;

import com.tmb.csnerd.demo.domain.repositories.postvote.projections.PostVotesInformationProjection;
import com.tmb.csnerd.demo.domain.repositories.postvote.PostVoteRepository;
import com.tmb.csnerd.demo.domain.repositories.talkvote.projections.TalkVotesByUserProjection;
import com.tmb.csnerd.demo.domain.repositories.talkvote.projections.TalkVotesInformationProjection;
import com.tmb.csnerd.demo.domain.repositories.talkvote.TalkVoteRepository;
import com.tmb.csnerd.demo.dto.VoteStatsDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class VoteContentLoader {
    private final PostVoteRepository postVoteRepository;
    private final TalkVoteRepository talkVoteRepository;

    public Map<Long, VoteStatsDTO> loadPostVoteInformationByPostIds(Set<Long> ids) {
        List<PostVotesInformationProjection> voteInformationList = postVoteRepository.getPostVoteInformationByIds(ids);
        return voteInformationList.stream().collect(Collectors.toMap(PostVotesInformationProjection::getPostId, v -> VoteStatsDTO.from(v.getUpvoteCount(), v.getDownvoteCount(), v.getVoteVersion())));
    }

    public Map<Long, VoteStatsDTO> loadTalkVoteInformationByTalkIds(Set<Long> ids) {
        List<TalkVotesInformationProjection> voteInformationList = talkVoteRepository.getTalkVoteInformationByIds(ids);
        return voteInformationList.stream().collect(Collectors.toMap(TalkVotesInformationProjection::getTalkId, v -> VoteStatsDTO.from(v.getUpvoteCount(), v.getDownvoteCount(), v.getVoteVersion())));
    }

    public Map<Long, Byte> loadTalkVoteByTalkIdsForUser(Set<Long> ids, Long userId) {
        List<TalkVotesByUserProjection> voteInformationList = talkVoteRepository.getVoteForTalksByUser(ids, userId);
        return voteInformationList.stream().collect(Collectors.toMap(TalkVotesByUserProjection::getTalkId, TalkVotesByUserProjection::getVote));
    }
}
