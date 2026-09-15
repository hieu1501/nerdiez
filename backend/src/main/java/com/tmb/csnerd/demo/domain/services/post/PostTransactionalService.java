package com.tmb.csnerd.demo.domain.services.post;

import com.tmb.csnerd.demo.domain.cache.post.PostChangedEvent;
import com.tmb.csnerd.demo.domain.cache.tag.TagDetailsForAdminChangedEvent;
import com.tmb.csnerd.demo.domain.models.*;
import com.tmb.csnerd.demo.domain.services.category.CategoryQueryService;
import com.tmb.csnerd.demo.domain.services.image.ImageService;
import com.tmb.csnerd.demo.domain.services.publicuri.PublicResourceUriFactory;
import com.tmb.csnerd.demo.domain.services.tag.TagQueryService;
import com.tmb.csnerd.demo.dto.post.request.AdminCreatePostRequestDTO;
import com.tmb.csnerd.demo.dto.post.request.AdminPatchPostRequestDTO;
import com.tmb.csnerd.demo.dto.post.request.PublicCreatePostRequestDTO;
import com.tmb.csnerd.demo.dto.post.request.PublicPatchPostRequestDTO;
import com.tmb.csnerd.demo.exceptions.UnauthorizedException;
import com.tmb.csnerd.demo.exceptions.post.PostByIdNotFoundException;
import com.tmb.csnerd.demo.domain.repositories.post.PostRepository;
import com.tmb.csnerd.demo.domain.security.UserPrincipal;
import com.tmb.csnerd.demo.exceptions.post.PostByPublicUriNotFoundException;
import com.tmb.csnerd.demo.utils.MarkdownUtils;
import com.tmb.csnerd.demo.domain.services.media.MediaUtils;
import com.tmb.csnerd.demo.utils.SlugifyUtils;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;

@RequiredArgsConstructor
@Service
public class PostTransactionalService {
    private final PostRepository postRepository;
    private final TagQueryService tagQueryService;
    private final ImageService imageService;
    private final MarkdownUtils markdownUtils;
    private final MediaUtils mediaUtils;
    private final ApplicationEventPublisher eventPublisher;
    private final CategoryQueryService categoryQueryService;
    private final PublicResourceUriFactory publicResourceUriFactory;

    @Transactional
    public Post createPostTransactional(AdminCreatePostRequestDTO request, UserPrincipal author, String publicKey) {
        requireAuthenticated(author);
        Category category = categoryQueryService.getCategoryById(request.categoryId());
        List<String> imagePaths = new ArrayList<>();
        Set<Tag> requestedTags = request.tagIds().isEmpty() ? Set.of() : tagQueryService.getTagsByIds(request.tagIds());
        Post post = createPost(category, author.getUser(), requestedTags, request.title(), request.content(), publicKey, request.featuredImage(), request.description(), request.isActive(), imagePaths);

        Post saved = postRepository.saveAndFlush(post);
        imageService.setImagesInUse(Set.copyOf(imagePaths));
        return saved;
    }

    @Transactional
    public Post createPostTransactional(PublicCreatePostRequestDTO request, UserPrincipal author, String publicKey) {
        requireAuthenticated(author);
        Category category = categoryQueryService.getActiveCategoryBySlug(request.categorySlug());
        List<String> imagePaths = new ArrayList<>();
        Set<Tag> requestedTags = request.tagSlugs().isEmpty() ? Set.of() : tagQueryService.getActiveTagsBySlugNames(request.tagSlugs());
        Post post = createPost(category, author.getUser(), requestedTags, request.title(), request.content(), publicKey, request.featuredImage(), request.description(), request.isActive(), imagePaths);

        Post saved = postRepository.saveAndFlush(post);
        imageService.setImagesInUse(Set.copyOf(imagePaths));
        return saved;
    }

    @Transactional
    public Post patchPostTransactional(Long postId, AdminPatchPostRequestDTO request, UserPrincipal author) {
        requireAuthenticated(author);
        Post post = findPostForModify(postId);
        requireOwnerOrAdmin(post.getAuthor(), author);
        List<String> currentImagePaths = new ArrayList<>();
        List<String> newImagePaths = new ArrayList<>();
        Post updated = patchPost(post, request.title(), request.content(), request.featuredImage(), request.description(), request.isActive(), currentImagePaths, newImagePaths);
        // Update tags
        if (request.tagIds() != null && !request.tagIds().isEmpty()) {
            Set<Tag> requestedTags = tagQueryService.getTagsByIds(request.tagIds());
            updateTagsForPost(updated, requestedTags);
        }
        Post saved = postRepository.save(updated);
        imageService.updateImagesUseCount(Set.copyOf(newImagePaths), Set.copyOf(currentImagePaths));
        eventPublisher.publishEvent(new PostChangedEvent(postId));
        return saved;
    }

    @Transactional
    public Post patchPostTransactional(Long postId, PublicPatchPostRequestDTO request, UserPrincipal author) {
        requireAuthenticated(author);
        Post post = findPostForModify(postId);
        requireOwnerOrAdmin(post.getAuthor(), author);
        List<String> currentImagePaths = new ArrayList<>();
        List<String> newImagePaths = new ArrayList<>();
        Post updated = patchPost(post, request.title(), request.content(), request.featuredImage(), request.description(), request.isActive(), currentImagePaths, newImagePaths);
        // Update tags
        if (request.tagSlugs() != null && !request.tagSlugs().isEmpty()) {
            Set<Tag> requestedTags = tagQueryService.getActiveTagsBySlugNames(request.tagSlugs());
            updateTagsForPost(updated, requestedTags);
        }
        Post saved = postRepository.save(updated);
        imageService.updateImagesUseCount(Set.copyOf(newImagePaths), Set.copyOf(currentImagePaths));
        eventPublisher.publishEvent(new PostChangedEvent(postId));
        return saved;
    }

    private Post createPost(Category category, User author, Set<Tag> tags, String title, String content, String publicKey, String featuredImage, String description, Boolean isActive, List<String> imagePaths) {
        featuredImage = mediaUtils.isAllowedMediaUrl(featuredImage) ? featuredImage : null;
        String featuredImageUrl = null;
        if (featuredImage != null) {
            featuredImageUrl = mediaUtils.extractImagePathFromUrl(featuredImage);
        }
        String slug = createSlug(title);
        String publicUri = publicResourceUriFactory.createPublicUri(slug, publicKey);
        Post post = new Post();
        post.setTitle(title);
        post.setContent(markdownUtils.normalizeMarkdownAndExtractImageUrls(content, imagePaths));
        post.setSlug(slug);
        post.setPublicUri(publicUri);
        post.setCreatedAt(Instant.now());
        post.setUpdatedAt(Instant.now());
        post.setCategory(category);
        post.setAuthor(author);
        post.setIsActive(isActive);
        post.setFeaturedImage(featuredImageUrl);
        post.setDescription(description);
        updateTagsForPost(post, tags);
        attachMetadata(post);
        // Links to images
        if (featuredImageUrl != null) {
            imagePaths.add(featuredImageUrl);
        }
        return post;
    }

    private Post patchPost(Post post, String title, String content, String featuredImage, String description, Boolean isActive, List<String> currentImagePaths, List<String> newImagePaths) {
        // Update title
        if (title != null) {
            if (title.isBlank()) {
                throw new IllegalArgumentException("Title must not be blank");
            }
            if (!title.equals(post.getTitle())) {
                post.setTitle(title);
                post.setSlug(createSlug(title));
            }
        }
        // Update content
        if (post.getContent() != null) {
            currentImagePaths.addAll(markdownUtils.extractImagePathsInContent(post.getContent()));
        }
        if (content == null) {
            newImagePaths.addAll(currentImagePaths);
        }
        else {
            if (content.isBlank()) {
                throw new IllegalArgumentException("Content must not be blank");
            }
            String normalizedContent = markdownUtils.normalizeMarkdownAndExtractImageUrls(content, newImagePaths);
            post.setContent(normalizedContent);
        }
        // Update featured image
        String currentFeatureImageUrl = null;
        if (post.getFeaturedImage() != null) {
            currentFeatureImageUrl = post.getFeaturedImage();
            currentImagePaths.add(currentFeatureImageUrl);
        }
        if (featuredImage == null) {
            newImagePaths.add(currentFeatureImageUrl);
        }
        else {
            if (featuredImage.isBlank()) {
                throw new IllegalArgumentException("Featured image must not be blank");
            }
            if (!mediaUtils.isAllowedMediaUrl(featuredImage)) {
                throw new IllegalArgumentException("Featured image is invalid");
            }
            String newFeaturedImagePath = mediaUtils.extractImagePathFromUrl(featuredImage);
            if (newFeaturedImagePath == null) {
                throw new IllegalArgumentException("Featured image URL is invalid");
            }
            post.setFeaturedImage(newFeaturedImagePath);
            newImagePaths.add(newFeaturedImagePath);
        }
        // Update description
        if (description != null) {
            if (description.isBlank()) {
                throw new IllegalArgumentException("Description must not be blank");
            }
            if (!description.equals(post.getDescription())) {
                post.setDescription(description);
            }
        }
        // Update active
        if (isActive!= null) {
            post.setIsActive(isActive);
        }
        post.setUpdatedAt(Instant.now());
        return post;
    }


    @Transactional
    public void softDeletePostTransactional(Long postId, UserPrincipal author) {
        requireAuthenticated(author);
        Post post = findPostForModify(postId);
        requireOwnerOrAdmin(post.getAuthor(), author);
        post.setIsActive(false);
        post.setUpdatedAt(Instant.now());
        postRepository.save(post);
        eventPublisher.publishEvent(new PostChangedEvent(postId));
    }

    @Transactional
    public void hardDeletePostTransactional(Long postId, UserPrincipal author) {
        requireAuthenticated(author);
        Post post = findPostForModify(postId);
        requireOwnerOrAdmin(post.getAuthor(), author);
        List<String> currentImagePaths = new ArrayList<>();
        if (post.getContent() != null) {
            currentImagePaths.addAll(markdownUtils.extractImagePathsInContent(post.getContent()));
        }
        if (post.getFeaturedImage() != null) {
            currentImagePaths.add(post.getFeaturedImage());
        }
        imageService.setImagesNotInUse(Set.copyOf(currentImagePaths));
        postRepository.delete(post);
        eventPublisher.publishEvent(new PostChangedEvent(postId));
    }

    private void updateTagsForPost(Post post, Set<Tag> requestedTags) {
        if (requestedTags == null || requestedTags.isEmpty()) return;
        Set<Tag> currentTags = post.getTags();
        if (currentTags == null) {
            currentTags = new HashSet<>();
            post.setTags(currentTags);
        }
        Set<Tag> tagsToAdd = new HashSet<>(requestedTags);
        tagsToAdd.removeAll(currentTags);
        currentTags.removeIf(tag -> !requestedTags.contains(tag));
        currentTags.addAll(tagsToAdd);
        eventPublisher.publishEvent(new TagDetailsForAdminChangedEvent());
    }

    private Post findPostForModify(Long id) {
        return postRepository.getPostByPostId(id).orElseThrow(() -> new PostByIdNotFoundException(id));
    }

    private String createSlug(String title) {
        return SlugifyUtils.slugify(title);
    }

    private void attachMetadata(Post post) {
        PostMetadata postMetadata = new PostMetadata();
        postMetadata.setPost(post);
        post.setPostMetadata(postMetadata);
    }

    private void requireAuthenticated(UserPrincipal principal) {
        if (principal == null) throw new UnauthorizedException(HttpStatus.UNAUTHORIZED);
    }

    private void requireOwnerOrAdmin(User author, UserPrincipal principal) {
        if (!principal.isAdmin() && !Objects.equals(author.getId(), principal.getUser().getId())) {
            throw new UnauthorizedException(HttpStatus.FORBIDDEN);
        }
    }
}
