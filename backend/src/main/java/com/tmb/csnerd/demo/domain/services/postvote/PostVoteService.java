package com.tmb.csnerd.demo.domain.services.postvote;

import com.tmb.csnerd.demo.domain.repositories.post.PostRepository;
import com.tmb.csnerd.demo.domain.repositories.post.projections.PostVotesInformationProjection;
import com.tmb.csnerd.demo.domain.repositories.vote.PostVoteRepository;
import com.tmb.csnerd.demo.domain.security.UserPrincipal;
import com.tmb.csnerd.demo.domain.services.post.PostQueryService;
import com.tmb.csnerd.demo.dto.post.PostVoteStatsDTO;
import com.tmb.csnerd.demo.dto.vote.PostVoteResponseDTO;
import com.tmb.csnerd.demo.exceptions.post.PostByNameNotMatchCategoryException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PostVoteService {
    private final PostVoteRepository postVoteRepository;
    private final PostRepository postRepository;

    public Map<Long, PostVoteStatsDTO> getPostVoteInformationByPostIds(List<Long> ids) {
        List<PostVotesInformationProjection> voteInformationList = postVoteRepository.getPostVoteInformationByIds(ids);
        return voteInformationList.stream().collect(Collectors.toMap(PostVotesInformationProjection::getPostId, v -> PostVoteStatsDTO.from(v.getUpvoteCount(), v.getDownvoteCount(), v.getVoteVersion())));
    }

    public PostVoteStatsDTO getPostVoteInformationByCategorySlugAndSlugName(String categorySlug, String slugPostName) {
        PostVotesInformationProjection postVoteStats = postRepository.getPostVoteInformationByCategorySlugAndSlugName(categorySlug, slugPostName)
                .orElseThrow(() -> new PostByNameNotMatchCategoryException(slugPostName, categorySlug));
        return PostVoteStatsDTO.from(postVoteStats.getUpvoteCount(), postVoteStats.getDownvoteCount(), postVoteStats.getVoteVersion());
    }

    public Byte getVoteForPostIdByUserId(Long postId, Long userId) {
        return postVoteRepository.getVoteForPostIdByUserId(postId, userId).orElse(null);
    }

    @Transactional
    public PostVoteResponseDTO setVote(String categorySlug, String postSlugName, UserPrincipal user, Byte vote) {
        Long postId = postRepository.getPostIdByCategorySlugAndPostSlug(categorySlug, postSlugName).orElseThrow(() -> new PostByNameNotMatchCategoryException(postSlugName, categorySlug));
        int rowAffected = postVoteRepository.upsertVote(postId, user.getUser().getId(), vote);
        PostVoteStatsDTO voteStats = getPostVoteInformationByCategorySlugAndSlugName(categorySlug, postSlugName);
        return new PostVoteResponseDTO(categorySlug, postSlugName, vote, voteStats);
    }
}
