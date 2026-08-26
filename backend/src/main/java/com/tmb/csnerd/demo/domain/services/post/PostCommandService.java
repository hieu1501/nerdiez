package com.tmb.csnerd.demo.domain.services.post;

import com.tmb.csnerd.demo.Application;
import com.tmb.csnerd.demo.domain.cache.post.PostChangedEvent;
import com.tmb.csnerd.demo.domain.models.*;
import com.tmb.csnerd.demo.domain.services.category.CategoryQueryService;
import com.tmb.csnerd.demo.domain.services.image.ImageService;
import com.tmb.csnerd.demo.domain.services.topic.TopicQueryService;
import com.tmb.csnerd.demo.dto.post.PostVoteStatsDTO;
import com.tmb.csnerd.demo.dto.post.adminresponse.AdminPostDetailContentDTO;
import com.tmb.csnerd.demo.dto.post.adminresponse.AdminPostDetailDTO;
import com.tmb.csnerd.demo.dto.post.request.CreatePostRequestDTO;
import com.tmb.csnerd.demo.dto.post.request.PatchPostRequestDTO;
import com.tmb.csnerd.demo.dto.post.request.PutPostRequestDTO;
import com.tmb.csnerd.demo.exceptions.UnauthorizedException;
import com.tmb.csnerd.demo.exceptions.post.PostByIdNotFoundException;
import com.tmb.csnerd.demo.domain.repositories.post.PostRepository;
import com.tmb.csnerd.demo.domain.security.UserPrincipal;
import com.tmb.csnerd.demo.utils.MarkdownUtils;
import com.tmb.csnerd.demo.utils.MediaUtils;
import com.tmb.csnerd.demo.utils.SlugifyUtils;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@RequiredArgsConstructor
@Service
public class PostCommandService {
    private final PostRepository postRepository;
    private final CategoryQueryService categoryQueryService;
    private final TopicQueryService topicQueryService;
    private final ImageService imageService;
    private final MarkdownUtils markdownUtils;
    private final MediaUtils mediaUtils;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public AdminPostDetailDTO createPostForAdmin(CreatePostRequestDTO request, UserPrincipal author) {
        if (author == null) {
            throw new UnauthorizedException(HttpStatus.UNAUTHORIZED);
        }
        Category category = categoryQueryService.getCategoryById(request.categoryId());
        // Sanitizing request
        List<String> imagePaths = new ArrayList<>();
        String title = request.title();
        String content = markdownUtils.normalizeMarkdownAndExtractImageUrls(request.content(), imagePaths);
        String description = request.description();
        String featuredImage = mediaUtils.isAllowedMediaUrl(request.featuredImage()) ? request.featuredImage() : null;
        String featuredImageUrl = null;
        if (featuredImage != null) {
            featuredImageUrl = mediaUtils.extractImagePathFromUrl(featuredImage);
        }
        // Add post
        Post post = new Post();
        post.setTitle(title);
        post.setContent(content);
        post.setSlug(SlugifyUtils.slugify(title));
        post.setCreatedAt(Instant.now());
        post.setUpdatedAt(Instant.now());
        post.setAuthor(author.getUser());
        post.setCategory(category);
        post.setIsActive(request.isActive() != null && request.isActive());
        Set<Long> topicIds = request.topicIds() == null ? Set.of() : request.topicIds();
        updateTopicsForPost(post, topicIds);
        PostMetadata postMetadata = new PostMetadata();
        if (featuredImageUrl != null) {
            post.setFeaturedImage(featuredImageUrl);
        }
        if (description!= null) {
            post.setDescription(description);
        }
        post.setPostMetadata(postMetadata);
        postMetadata.setPost(post);
        post = postRepository.save(post);
        // Links to images
        if (featuredImageUrl != null) {
            imagePaths.add(featuredImageUrl);
        }
        imageService.setImagesLinkedToPost(imagePaths, post);

        return convertToAdminPostDetailDTO(post);
    }

    @Transactional
    public AdminPostDetailDTO patchPostForAdmin(Long postId, PatchPostRequestDTO request, UserPrincipal author) {
        if (author == null) {
            throw new UnauthorizedException(HttpStatus.UNAUTHORIZED);
        }
        Post post = postRepository.findById(postId).
                orElseThrow(() -> new PostByIdNotFoundException(postId));
        if (!post.getAuthor().getId().equals(author.getUser().getId())) {
            throw new UnauthorizedException(HttpStatus.FORBIDDEN);
        }
        // Sanitizing request
        List<String> imagePaths = new ArrayList<>();
        String title = request.title();
        String content = markdownUtils.normalizeMarkdownAndExtractImageUrls(request.content(), imagePaths);
        String description = request.description();
        String featuredImage = mediaUtils.isAllowedMediaUrl(request.featuredImage()) ? request.featuredImage() : null;
        String featuredImageUrl = null;
        if (featuredImage != null) {
            featuredImageUrl = mediaUtils.extractImagePathFromUrl(featuredImage);
        }
        // Update post
        if (checkPostAttributeCanBeChanged(title, post.getTitle())) {
            post.setTitle(title);
            post.setSlug(SlugifyUtils.slugify(title));
        }
        if (checkPostAttributeCanBeChanged(content, post.getContent())) {
            post.setContent(content);
        }
        if (checkPostAttributeCanBeChanged(featuredImageUrl, post.getFeaturedImage())) {
            post.setFeaturedImage(featuredImageUrl);
        }
        if (checkPostAttributeCanBeChanged(description, post.getDescription())) {
            post.setDescription(description);
        }
        if (checkPostAttributeCanBeChanged(request.categoryId(), post.getCategory().getId())) {
            Category category = categoryQueryService.getCategoryById(request.categoryId());
            post.setCategory(category);
        }
        if (checkPostAttributeCanBeChanged(request.isActive(), post.getIsActive())) {
            post.setIsActive(request.isActive());
        }
        Set<Long> topicIds = request.topicIds() == null ? Set.of() : request.topicIds();
        updateTopicsForPost(post, topicIds);
        // Update images linked to post
        if (featuredImageUrl != null) {
            imagePaths.add(featuredImageUrl);
        }
        imageService.updateImagesLinkedToPost(imagePaths, post);

        Post updatedPost = postRepository.save(post);
        eventPublisher.publishEvent(new PostChangedEvent(updatedPost.getId()));
        return convertToAdminPostDetailDTO(updatedPost);
    }

    @Transactional
    public AdminPostDetailDTO putPostForAdmin(Long postId, PutPostRequestDTO request, UserPrincipal author) {
        if (author == null) {
            throw new UnauthorizedException(HttpStatus.UNAUTHORIZED);
        }
        Category category = categoryQueryService.getCategoryById(request.categoryId());
        Post post = postRepository.findById(postId)
                .orElse(null);
        if (post != null) {
            if (!post.getAuthor().getId().equals(author.getUser().getId())) {
                throw new UnauthorizedException(HttpStatus.FORBIDDEN);
            }
        }
        // Create new post if not exists
        else {
            post = new Post();
            post.setCreatedAt(Instant.now());
            post.setAuthor(author.getUser());
            PostMetadata postMetadata = new PostMetadata();
            postMetadata.setPost(post);
            post.setPostMetadata(postMetadata);
        }
        // Sanitizing request
        List<String> imagePaths = new ArrayList<>();
        String title = request.title();
        String content = markdownUtils.normalizeMarkdownAndExtractImageUrls(request.content(), imagePaths);
        String description = request.description();
        String featuredImage = mediaUtils.isAllowedMediaUrl(request.featuredImage()) ? request.featuredImage() : null;
        String featuredImageUrl = null;
        if (featuredImage != null) {
            featuredImageUrl = mediaUtils.extractImagePathFromUrl(featuredImage);
        }
        // Update post
        post.setTitle(title);
        post.setContent(content);
        post.setSlug(SlugifyUtils.slugify(title));
        post.setUpdatedAt(Instant.now());
        post.setCategory(category);
        post.setIsActive(request.isActive() != null && request.isActive());
        post.setFeaturedImage(featuredImageUrl);
        post.setDescription(description);
        Set<Long> topicIds = request.topicIds() == null ? Set.of() : request.topicIds();
        updateTopicsForPost(post, topicIds);
        // Update images linked to post
        if (featuredImageUrl != null) {
            imagePaths.add(featuredImageUrl);
        }
        if (post.getId() != null) {
            imageService.updateImagesLinkedToPost(imagePaths, post);
        }
        else {
            imageService.setImagesLinkedToPost(imagePaths, post);
        }

        Post updatedPost = postRepository.save(post);
        eventPublisher.publishEvent(new PostChangedEvent(updatedPost.getId()));
        return convertToAdminPostDetailDTO(updatedPost);
    }

    @Transactional
    public void deactivatePostForAdmin(Long postId, UserPrincipal author) {
        if (author == null) {
            throw new UnauthorizedException(HttpStatus.UNAUTHORIZED);
        }
        Post post = postRepository.findById(postId).
                orElseThrow(() -> new PostByIdNotFoundException(postId));
        if (!post.getAuthor().getId().equals(author.getUser().getId())) {
            throw new UnauthorizedException(HttpStatus.FORBIDDEN);
        }
        post.setIsActive(false);
        Post updatedPost = postRepository.save(post);
        eventPublisher.publishEvent(new PostChangedEvent(updatedPost.getId()));
    }

    private boolean checkPostAttributeCanBeChanged(String newValue, String oldValue)
    {
        if (newValue == null) return false;
        if (oldValue == null) return true;
        return !oldValue.equals(newValue);
    }

    private boolean checkPostAttributeCanBeChanged(Long newValue, Long oldValue)
    {
        if (newValue == null) return false;
        if (oldValue == null) return true;
        return !oldValue.equals(newValue);
    }

    private boolean checkPostAttributeCanBeChanged(Boolean newValue, Boolean oldValue)
    {
        if (newValue == null) return false;
        if (oldValue == null) return true;
        return oldValue != newValue;
    }

    private void updateTopicsForPost(Post post, Set<Long> newTopicIds) {
        Set<Long> currentTopicIds = post.getTopicIds();
        Set<Long> topicsToAdd = new HashSet<>(newTopicIds);
        topicsToAdd.removeAll(currentTopicIds);
        Set<Long> topicsToRemove = new HashSet<>(currentTopicIds);
        topicsToRemove.removeAll(newTopicIds);

        if (!topicsToAdd.isEmpty()) {
            Set<Topic> newTopics = new HashSet<>(topicQueryService.findTopicsByIds(topicsToAdd));
            newTopics.forEach(post::addTopic);
        }

        if (!topicsToRemove.isEmpty()) {
            Set<Topic> toDeleteTopics = new HashSet<>(topicQueryService.findTopicsByIds(topicsToRemove));
            toDeleteTopics.forEach(post::removeTopic);
        }
    }

    private AdminPostDetailDTO convertToAdminPostDetailDTO(Post post) {
        String denormalizedContent = markdownUtils.denormalizeImageUrlsInContent(post.getContent());
        String denormalizedFeaturedImageUrl = mediaUtils.buildMediaUrl(post.getFeaturedImage());
        AdminPostDetailContentDTO content = AdminPostDetailContentDTO.from(post, denormalizedContent, denormalizedFeaturedImageUrl);
        PostMetadata postMetadata = post.getPostMetadata();
        Long upvoteCount = postMetadata.getUpvoteCount() != null ? postMetadata.getUpvoteCount() : 0;
        Long downvoteCount = postMetadata.getDownvoteCount() != null ? postMetadata.getDownvoteCount() : 0;
        PostVoteStatsDTO voteStats = PostVoteStatsDTO.from(upvoteCount, downvoteCount, null);
        return AdminPostDetailDTO.from(content, voteStats);
    }
}
