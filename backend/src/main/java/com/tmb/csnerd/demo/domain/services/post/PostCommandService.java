package com.tmb.csnerd.demo.domain.services.post;

import com.tmb.csnerd.demo.domain.models.*;
import com.tmb.csnerd.demo.domain.services.category.CategoryQueryService;
import com.tmb.csnerd.demo.domain.services.image.ImageService;
import com.tmb.csnerd.demo.domain.services.topic.TopicQueryService;
import com.tmb.csnerd.demo.dto.post.*;
import com.tmb.csnerd.demo.exceptions.UnauthorizedException;
import com.tmb.csnerd.demo.exceptions.post.PostNotFoundException;
import com.tmb.csnerd.demo.domain.repositories.PostRepository;
import com.tmb.csnerd.demo.domain.security.UserPrincipal;
import com.tmb.csnerd.demo.utils.MarkdownUtils;
import com.tmb.csnerd.demo.utils.MediaUtils;
import com.tmb.csnerd.demo.utils.SlugifyUtils;
import jakarta.transaction.Transactional;
import org.commonmark.node.AbstractVisitor;
import org.commonmark.node.Image;
import org.commonmark.node.Link;
import org.commonmark.node.Node;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class PostCommandService extends PostBaseService {
    private final PostRepository postRepository;
    private final CategoryQueryService categoryQueryService;
    private final TopicQueryService topicQueryService;
    private final ImageService imageService;

    public PostCommandService(PostRepository postRepository,
                              CategoryQueryService categoryQueryService,
                              TopicQueryService topicQueryService,
                              MarkdownUtils markdownUtils,
                              ImageService imageService,
                              MediaUtils mediaUtils) {
        super(mediaUtils, markdownUtils);
        this.postRepository = postRepository;
        this.categoryQueryService = categoryQueryService;
        this.topicQueryService = topicQueryService;
        this.imageService = imageService;
    }

    @Caching(evict = {
        @CacheEvict(cacheNames = "post-admin-list", allEntries = true),
        @CacheEvict(cacheNames = "post-public-list", allEntries = true),
    })
    @Transactional
    public AdminPostDetailDTO createPostForAdmin(CreatePostRequestDTO request, UserPrincipal author) {
        if (author == null) {
            throw new UnauthorizedException(HttpStatus.UNAUTHORIZED);
        }
        Category category = categoryQueryService.getCategoryById(request.categoryId());
        // Sanitizing request
        List<String> imagePaths = new ArrayList<>();
        String title = request.title();
        String content = normalizeMarkdownAndExtractImageUrls(request.content(), imagePaths);
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
            postMetadata.setFeaturedImage(featuredImageUrl);
        }
        if (description!= null) {
            postMetadata.setDescription(description);
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

    @Caching(evict = {
        @CacheEvict(cacheNames = "post-admin-list", allEntries = true),
        @CacheEvict(cacheNames = "post-public-list", allEntries = true),
        @CacheEvict(cacheNames = "post-detail", key = "'admin:detail:' + #postId"),
        @CacheEvict(cacheNames = "post-detail", key = "'public:detail:' + #postId")
    })
    @Transactional
    public AdminPostDetailDTO patchPostForAdmin(Long postId, PatchPostRequestDTO request, UserPrincipal author) {
        if (author == null) {
            throw new UnauthorizedException(HttpStatus.UNAUTHORIZED);
        }
        Post post = postRepository.findById(postId).
                orElseThrow(() -> new PostNotFoundException(postId));
        if (!post.getAuthor().getId().equals(author.getUser().getId())) {
            throw new UnauthorizedException(HttpStatus.FORBIDDEN);
        }
        // Sanitizing request
        List<String> imagePaths = new ArrayList<>();
        String title = request.title();
        String content = normalizeMarkdownAndExtractImageUrls(request.content(), imagePaths);
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
        if (checkPostAttributeCanBeChanged(featuredImageUrl, post.getPostMetadata().getFeaturedImage())) {
            post.getPostMetadata().setFeaturedImage(featuredImageUrl);
        }
        if (checkPostAttributeCanBeChanged(description, post.getPostMetadata().getDescription())) {
            post.getPostMetadata().setDescription(description);
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
        return convertToAdminPostDetailDTO(postRepository.save(post));
    }

    @Caching(evict = {
        @CacheEvict(cacheNames = "post-admin-list", allEntries = true),
        @CacheEvict(cacheNames = "post-public-list", allEntries = true),
        @CacheEvict(cacheNames = "post-detail", key = "'admin:detail:' + #postId"),
        @CacheEvict(cacheNames = "post-detail", key = "'public:detail:' + #postId")
    })
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
        String content = normalizeMarkdownAndExtractImageUrls(request.content(), imagePaths);
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
        post.getPostMetadata().setFeaturedImage(featuredImageUrl);
        post.getPostMetadata().setDescription(description);
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
        return convertToAdminPostDetailDTO(postRepository.save(post));
    }

    @Caching(evict = {
        @CacheEvict(cacheNames = "post-admin-list", allEntries = true),
        @CacheEvict(cacheNames = "post-public-list", allEntries = true),
        @CacheEvict(cacheNames = "post-detail", key = "'admin:detail:' + #postId"),
        @CacheEvict(cacheNames = "post-detail", key = "'public:detail:' + #postId")
    })
    @Transactional
    public void deactivatePostForAdmin(Long postId, UserPrincipal author) {
        if (author == null) {
            throw new UnauthorizedException(HttpStatus.UNAUTHORIZED);
        }
        Post post = postRepository.findById(postId).
                orElseThrow(() -> new PostNotFoundException(postId));
        if (!post.getAuthor().getId().equals(author.getUser().getId())) {
            throw new UnauthorizedException(HttpStatus.FORBIDDEN);
        }
        post.setIsActive(false);
        postRepository.save(post);
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

    private String normalizeMarkdownAndExtractImageUrls(String content, List<String> imagePaths) {
        Node document = markdownUtils.parseDocument(content);
        List<String> errors = new ArrayList<>();

        document.accept(new AbstractVisitor() {
            @Override
            public void visit(Link link) {
                String url = markdownUtils.normalizeUrl(link.getDestination(), "link", errors);
                if (!errors.isEmpty()) {
                    throw new IllegalArgumentException(String.join("; ", errors));
                }
                link.setDestination(url);
                super.visit(link);
            }

            @Override
            public void visit(Image image) {
                String url = markdownUtils.normalizeUrl(image.getDestination(), "image", errors);
                if (!errors.isEmpty()) {
                    throw new IllegalArgumentException(String.join("; ", errors));
                }
                imagePaths.add(url.split("[?#]")[0]); // Don't store queries and fragments to database
                image.setDestination(url);
                super.visit(image);
            }
        });
        return markdownUtils.renderDocument(document);
    }
}
