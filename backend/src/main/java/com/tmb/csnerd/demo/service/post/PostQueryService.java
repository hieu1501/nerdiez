package com.tmb.csnerd.demo.service.post;

import com.tmb.csnerd.demo.dto.post.PostItemDTO;
import com.tmb.csnerd.demo.exception.post.PostNotFound;
import com.tmb.csnerd.demo.model.Post;
import com.tmb.csnerd.demo.model.PostsVote;
import com.tmb.csnerd.demo.repository.PostRepository;
import lombok.AllArgsConstructor;
import org.springframework.data.util.Pair;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;

@AllArgsConstructor
@Service
public class PostQueryService {
    private final PostRepository postRepository;

    public List<PostItemDTO> findMostRecentActivePost() {
        List<Post> posts = postRepository.findMostRecentActivePost();
        return posts.stream()
                .map(this::convertToPostItemDTO)
                .toList();
    }

    public List<PostItemDTO> findMostUpvotedActivePost() {
        List<Post> posts = postRepository.findMostUpvotedActivePost();
        return posts.stream()
                .map(this::convertToPostItemDTO)
                .toList();
    }

    public PostItemDTO findArticle(Integer id) {
        Post post = postRepository.findActivePostByPostId(id)
                .orElse(null);
        return post != null ? convertToPostItemDTO(post) : null;
    }

    private PostItemDTO convertToPostItemDTO(Post post) {
        Pair<Integer, Integer> voteResult = getVoteCount(post.getVotes());
        return new PostItemDTO(
            post.getId(),
            post.getTitle(),
            post.getSlug(),
            post.getContent(),
            post.getAuthor().getUsername(),
            post.getCategory(),
            post.getCreatedAt(),
            post.getTopics(),
            post.getPostMetadata().getFeaturedImage(),
            voteResult.getFirst(),
            voteResult.getSecond()
        );
    }

    // First value is upvote, second is downvote
    private Pair<Integer, Integer> getVoteCount(List<PostsVote> postsVote) {
        int upvotes = 0;
        int downvotes = 0;
        for (PostsVote vote : postsVote)
        {
            if (vote.getIsActive() && vote.getVote() != 0)
            {
                if (vote.getVote() == 1) upvotes++;
                if (vote.getVote() == -1) downvotes++;
            }
        }
        return Pair.of(upvotes, downvotes);
    }
}
