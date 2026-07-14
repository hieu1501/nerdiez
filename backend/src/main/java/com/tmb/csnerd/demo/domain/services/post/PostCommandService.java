package com.tmb.csnerd.demo.domain.services.post;

import com.tmb.csnerd.demo.domain.models.*;
import com.tmb.csnerd.demo.dto.post.CreatePostDTO;
import com.tmb.csnerd.demo.dto.post.PostItemDTO;
import com.tmb.csnerd.demo.dto.post.ReplacePostDTO;
import com.tmb.csnerd.demo.dto.post.UpdatePostDTO;
import com.tmb.csnerd.demo.exceptions.UnauthorizedException;
import com.tmb.csnerd.demo.exceptions.category.CategoryNotFoundException;
import com.tmb.csnerd.demo.exceptions.post.PostNotFoundException;
import com.tmb.csnerd.demo.domain.repositories.CategoryRepository;
import com.tmb.csnerd.demo.domain.repositories.PostRepository;
import com.tmb.csnerd.demo.domain.repositories.TopicRepository;
import com.tmb.csnerd.demo.domain.repositories.UserRepository;
import com.tmb.csnerd.demo.domain.security.UserPrincipal;
import com.tmb.csnerd.demo.utils.SlugifyUtils;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.data.util.Pair;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Set;

@AllArgsConstructor
@Service
public class PostCommandService {
    private final PostRepository postRepository;
    private final CategoryRepository categoryRepository;
    private final TopicRepository topicRepository;

    @Transactional
    public PostItemDTO createPost(CreatePostDTO request, UserPrincipal author) {
        if (author == null) {
            throw new UnauthorizedException(HttpStatus.UNAUTHORIZED);
        }
        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new CategoryNotFoundException(request.categoryId()));

        Post post = new Post();
        post.setTitle(request.title());
        post.setContent(request.content());
        post.setSlug(SlugifyUtils.slugify(request.title()));
        post.setCreatedAt(Instant.now());
        post.setUpdatedAt(Instant.now());
        post.setAuthor(author.getUser());
        post.setCategory(category);
        post.setIsActive(true);
        Set<Long> topicIds = request.topicIds() == null ? Set.of() : request.topicIds();
        List<Topic> topics = topicRepository.findAllById(topicIds);
        post.setTopics(topics);

        PostMetadata postMetadata = new PostMetadata();
        if (request.featuredImage() != null && !request.featuredImage().isEmpty()) {
            postMetadata.setFeaturedImage(request.featuredImage());
        }
        if (request.description() != null && !request.description().isEmpty()) {
            postMetadata.setDescription(request.description());
        }

        post.setPostMetadata(postMetadata);
        return convertToPostItemDTO(postRepository.save(post));
    }

    @Transactional
    public PostItemDTO patchPost(Long postId, UpdatePostDTO request, UserPrincipal author) {
        if (author == null) {
            throw new UnauthorizedException(HttpStatus.UNAUTHORIZED);
        }
        Post post = postRepository.findById(postId).
                orElseThrow(() -> new PostNotFoundException(postId));
        if (!post.getAuthor().getId().equals(author.getUser().getId())) {
            throw new UnauthorizedException(HttpStatus.FORBIDDEN);
        }
        if (checkPostAttributeCanBeChanged(request.title(), post.getTitle())) {
            post.setTitle(request.title());
            post.setSlug(SlugifyUtils.slugify(request.title()));
        }
        if (checkPostAttributeCanBeChanged(request.content(), post.getContent())) {
            post.setContent(request.content());
        }
        if (checkPostAttributeCanBeChanged(request.featuredImage(), post.getPostMetadata().getFeaturedImage())) {
            post.getPostMetadata().setFeaturedImage(request.featuredImage());
        }
        if (checkPostAttributeCanBeChanged(request.description(), post.getPostMetadata().getDescription())) {
            post.getPostMetadata().setDescription(request.description());
        }
        if (checkPostAttributeCanBeChanged(request.categoryId(), post.getCategory().getId())) {
            Category category = categoryRepository.findById(request.categoryId())
                    .orElseThrow(() -> new CategoryNotFoundException(request.categoryId()));
            post.setCategory(category);
        }
        if (checkPostAttributeCanBeChanged(request.topicIds(), post.getTopicIds())) {
            for (Topic topic : post.getTopics()) {
                topic.getPosts().remove(post);
            }
            post.getTopics().clear();
        }
        return convertToPostItemDTO(post);
    }

    @Transactional
    public PostItemDTO putPost(Long postId, ReplacePostDTO request, UserPrincipal author) {
        if (author == null) {
            throw new UnauthorizedException(HttpStatus.UNAUTHORIZED);
        }
        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new CategoryNotFoundException(request.categoryId()));
        Post post = postRepository.findById(postId)
                .orElse(null);
        if (post != null) {
            if (!post.getAuthor().getId().equals(author.getUser().getId())) {
                throw new UnauthorizedException(HttpStatus.FORBIDDEN);
            }
        }
        else {
            post = new Post();
            PostMetadata postMetadata = new PostMetadata();
            post.setPostMetadata(postMetadata);
            postRepository.save(post);
        }
        List<Topic> topics = topicRepository.findAllById(request.topicIds());
        post.setTitle(request.title());
        post.setSlug(SlugifyUtils.slugify(request.title()));
        post.setContent(request.content());
        post.setCategory(category);
        post.setTopics(topics);
        post.getPostMetadata().setFeaturedImage(request.featuredImage());
        post.getPostMetadata().setDescription(request.description());

        return convertToPostItemDTO(post);
    }

    @Transactional
    public void deletePost(Long postId, UserPrincipal author) {
        Post post = postRepository.findById(postId).
                orElseThrow(() -> new PostNotFoundException(postId));
        if (!post.getAuthor().getId().equals(author.getUser().getId())) {
            throw new UnauthorizedException(HttpStatus.FORBIDDEN);
        }
        post.setIsActive(false);
    }

    private boolean checkPostAttributeCanBeChanged(String newValue, String oldValue)
    {
        if (newValue == null || newValue.isEmpty()) return false;
        if (oldValue.equals(newValue)) return false;
        return true;
    }

    private boolean checkPostAttributeCanBeChanged(Long newValue, Long oldValue)
    {
        if (newValue == null) return false;
        if (oldValue.equals(newValue)) return false;
        return true;
    }

    private boolean checkPostAttributeCanBeChanged(Set<Long> newValue, Set<Long> oldValue)
    {
        if (newValue == null) return false;
        if (oldValue.equals(newValue)) return false;
        return true;
    }

    private PostItemDTO convertToPostItemDTO(Post post) {
        Pair<Integer, Integer> voteResult = getVoteCount(post.getVotes());
        return new PostItemDTO(
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
        Integer upvotes = 0;
        Integer downvotes = 0;
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
