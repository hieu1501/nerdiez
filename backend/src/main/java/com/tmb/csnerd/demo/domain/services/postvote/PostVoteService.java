package com.tmb.csnerd.demo.domain.services.postvote;

import com.tmb.csnerd.demo.domain.models.Post;
import com.tmb.csnerd.demo.domain.models.PostsVote;
import com.tmb.csnerd.demo.domain.models.PostsVoteId;
import com.tmb.csnerd.demo.domain.repositories.PostRepository;
import com.tmb.csnerd.demo.domain.repositories.PostVoteRepository;
import com.tmb.csnerd.demo.domain.security.UserPrincipal;
import com.tmb.csnerd.demo.exceptions.post.PostNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PostVoteService {
    private final PostVoteRepository postVoteRepository;
    private final PostRepository postRepository;

    @Transactional
    public void upvote(Long postId, UserPrincipal user) {
        vote(postId, user, (byte)1);
    }

    @Transactional
    public void downvote(Long postId, UserPrincipal user) {
        vote(postId, user, (byte)-1);
    }

    @Transactional
    public void unvote(Long postId, UserPrincipal user) {
        vote(postId, user, (byte)0);
    }

    private void vote(Long postId, UserPrincipal user, Byte value) {
        Post post = postRepository.findById(postId).
                orElseThrow(() -> new PostNotFoundException(postId));
        Long userId = user.getUser().getId();
        PostsVoteId postsVoteId = new PostsVoteId(postId, userId);
        PostsVote voteEntity = postVoteRepository.findById(postsVoteId).orElseGet(() -> {
            PostsVote newVoteEntity = new PostsVote();
            newVoteEntity.setId(postsVoteId);
            return newVoteEntity;
        });
        voteEntity.setVote(value);
        voteEntity.setIsActive(value != 0);
        postVoteRepository.save(voteEntity);
    }
}
