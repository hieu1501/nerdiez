package com.tmb.csnerd.demo.service.post;

import com.tmb.csnerd.demo.dto.post.PostItemDTO;
import com.tmb.csnerd.demo.model.Post;
import com.tmb.csnerd.demo.model.PostsVote;
import com.tmb.csnerd.demo.repository.PostRepository;
import lombok.AllArgsConstructor;
import org.springframework.data.util.Pair;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@AllArgsConstructor
@Service
public class PostQueryService {
    private final PostRepository postRepository;

    public List<PostItemDTO> findMostRecentActivePost() {
        List<Post> posts = postRepository.findMostRecentActivePost();
        List<Long> postIds = posts.stream().map(Post::getId).toList();
        Map<Long, Pair<Integer, Integer>> votesByPostIds = postRepository
                .findVoteCountsByPostIds(postIds)
                .stream()
                .filter(c -> c.length == 3)
                .collect(Collectors.toMap(c -> (Long) c[0],  c -> getVoteCount(c[1], c[2])));

        return posts.stream()
                .map(p -> convertToPostItemDTO(p, votesByPostIds.get(p.getId())))
                .toList();
    }

    public List<PostItemDTO> findMostUpvotedActivePost() {
        List<Post> posts = postRepository.findMostUpvotedActivePost();
        List<Long> postIds = posts.stream().map(Post::getId).toList();
        Map<Long, Pair<Integer, Integer>> votesByPostIds = postRepository
                .findVoteCountsByPostIds(postIds)
                .stream()
                .filter(c -> c.length == 3)
                .collect(Collectors.toMap(c -> (Long) c[0],  c -> getVoteCount(c[1], c[2])));
        return posts.stream()
                .map(p -> convertToPostItemDTO(p, votesByPostIds.get(p.getId())))
                .toList();
    }

    public PostItemDTO findArticle(Long id) {
        Post post = postRepository.findActivePostByPostId(id)
                .orElse(null);
        if (post == null) return null;
        Map<Long, Pair<Integer, Integer>> votesByPostIds = postRepository
                .findVoteCountsByPostIds(List.of(post.getId()))
                .stream()
                .filter(c -> c.length == 3)
                .collect(Collectors.toMap(c -> (Long) c[0],  c -> getVoteCount(c[1], c[2])));
        return convertToPostItemDTO(post, votesByPostIds.get(post.getId()));
    }

    private PostItemDTO convertToPostItemDTO(Post post, Pair<Integer, Integer> voteCounts) {
        return new PostItemDTO(
            post.getTitle(),
            post.getSlug(),
            post.getContent(),
            post.getAuthor().getUsername(),
            post.getCategory(),
            post.getCreatedAt(),
            post.getTopics(),
            post.getPostMetadata().getFeaturedImage(),
            voteCounts != null ? voteCounts.getFirst() : 0,
            voteCounts != null ? voteCounts.getSecond() : 0
        );
    }

    // First value is upvote, second is downvote
    private Pair<Integer, Integer> getVoteCount(Object upvoteCount, Object downvoteCount) {
        int upvotes = 0;
        int downvotes = 0;
        if (upvoteCount instanceof Integer) {
            upvotes = (Integer) upvoteCount;
        }
        if (downvoteCount instanceof Integer) {
            upvotes = (Integer) downvoteCount;
        }
        return Pair.of(upvotes, downvotes);
    }
}
