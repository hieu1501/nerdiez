package com.tmb.csnerd.demo.domain.services.post;

import com.tmb.csnerd.demo.domain.models.Post;
import com.tmb.csnerd.demo.domain.repositories.post.PostRepository;
import com.tmb.csnerd.demo.domain.security.UserPrincipal;
import com.tmb.csnerd.demo.domain.services.publicuri.PublicResourceUriFactory;
import com.tmb.csnerd.demo.domain.services.vote.VoteService;
import com.tmb.csnerd.demo.dto.VoteStatsDTO;
import com.tmb.csnerd.demo.dto.post.adminresponse.AdminPostDetailContentDTO;
import com.tmb.csnerd.demo.dto.post.adminresponse.AdminPostDetailDTO;
import com.tmb.csnerd.demo.dto.post.publicresponse.PersonalPostDetailContentDTO;
import com.tmb.csnerd.demo.dto.post.publicresponse.PersonalPostDetailDTO;
import com.tmb.csnerd.demo.dto.post.request.AdminCreatePostRequestDTO;
import com.tmb.csnerd.demo.dto.post.request.AdminPatchPostRequestDTO;
import com.tmb.csnerd.demo.dto.post.request.PublicCreatePostRequestDTO;
import com.tmb.csnerd.demo.dto.post.request.PublicPatchPostRequestDTO;
import com.tmb.csnerd.demo.exceptions.post.PostByPublicUriNotFoundException;
import com.tmb.csnerd.demo.utils.MarkdownUtils;
import com.tmb.csnerd.demo.domain.services.media.MediaUtils;
import com.tmb.csnerd.demo.domain.services.publicuri.PublicKeyGenerator;
import lombok.RequiredArgsConstructor;
import org.hibernate.exception.ConstraintViolationException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import java.net.URI;

@Service
@RequiredArgsConstructor
public class PostCommandService {
    private static final int MAX_PUBLIC_URI_ATTEMPTS = 3;

    private final PublicKeyGenerator publicKeyGenerator;
    private final MarkdownUtils markdownUtils;
    private final MediaUtils mediaUtils;
    private final PostTransactionalService postTransactionalService;
    private final VoteService postVoteService;
    private final PublicResourceUriFactory publicResourceUriFactory;
    private final PostRepository postRepository;

    public AdminPostDetailDTO createPostForAdmin(AdminCreatePostRequestDTO request, UserPrincipal author) {
        Post createdPost = createPost(request, author);
        VoteStatsDTO voteStats = postVoteService.DEFAULT_VOTE_STATS; // Newly created post does not have vote information yet
        return convertToAdminPostDetailDTO(createdPost, voteStats);
    }

    public PersonalPostDetailDTO createPostForProfile(PublicCreatePostRequestDTO request, UserPrincipal author) {
        Post createdPost = createPost(request, author);
        VoteStatsDTO voteStats = postVoteService.DEFAULT_VOTE_STATS; // Newly created post does not have vote information yet
        return convertToProfilePostDetailDTO(createdPost, voteStats);
    }

    public AdminPostDetailDTO patchPostById(Long postId, AdminPatchPostRequestDTO request, UserPrincipal author) {
        Post updatedPost = postTransactionalService.patchPostTransactional(postId, request, author);
        VoteStatsDTO voteStats = postVoteService.getPostVoteInformationByPostId(postId);
        return convertToAdminPostDetailDTO(updatedPost, voteStats);
    }

    public PersonalPostDetailDTO patchPostByPublicUri(String publicUri, PublicPatchPostRequestDTO request, UserPrincipal author) {
        Long postId = postRepository.getActivePostIdByPublicUri(publicUri).orElseThrow(() -> new PostByPublicUriNotFoundException(publicUri));
        Post updatedPost = postTransactionalService.patchPostTransactional(postId, request, author);
        VoteStatsDTO voteStats = postVoteService.getPostVoteInformationByPostId(postId);
        return convertToProfilePostDetailDTO(updatedPost, voteStats);
    }

    public void softDeletePostById(Long postId,  UserPrincipal author) {
        postTransactionalService.softDeletePostTransactional(postId, author);
    }

    public void softDeletePostByPublicUri(String publicUri,  UserPrincipal author) {
        Long postId = postRepository.getActivePostIdByPublicUri(publicUri).orElseThrow(() -> new PostByPublicUriNotFoundException(publicUri));
        postTransactionalService.softDeletePostTransactional(postId, author);
    }

    public void hardDeletePostById(Long postId,  UserPrincipal author) {
        postTransactionalService.hardDeletePostTransactional(postId, author);
    }

    public void hardDeletePostByPublicUri(String publicUri,  UserPrincipal author) {
        Long postId = postRepository.getActivePostIdByPublicUri(publicUri).orElseThrow(() -> new PostByPublicUriNotFoundException(publicUri));
        postTransactionalService.hardDeletePostTransactional(postId, author);
    }

    private Post createPost(AdminCreatePostRequestDTO request, UserPrincipal author) {
        for (int attempt = 0; attempt < MAX_PUBLIC_URI_ATTEMPTS; ++attempt) {
            try {
                return postTransactionalService.createPostTransactional(request, author, publicKeyGenerator.generate());
            } catch (DataIntegrityViolationException | ConstraintViolationException e) {
                continue;
            }
        }
        throw new IllegalStateException("Unable to generate a unique Post public URI");
    }

    private Post createPost(PublicCreatePostRequestDTO request, UserPrincipal author) {
        for (int attempt = 0; attempt < MAX_PUBLIC_URI_ATTEMPTS; ++attempt) {
            try {
                return postTransactionalService.createPostTransactional(request, author, publicKeyGenerator.generate());
            } catch (DataIntegrityViolationException | ConstraintViolationException e) {
                continue;
            }
        }
        throw new IllegalStateException("Unable to generate a unique Post public URI");
    }

    private AdminPostDetailDTO convertToAdminPostDetailDTO(Post post, VoteStatsDTO voteStats) {
        String denormalizedContent = markdownUtils.denormalizeImageUrlsInContent(post.getContent());
        String denormalizedFeaturedImageUrl = mediaUtils.buildMediaUrl(post.getFeaturedImage());
        URI canonicalUri = publicResourceUriFactory.post(post.getPublicUri(), false);
        AdminPostDetailContentDTO content = AdminPostDetailContentDTO.from(post, denormalizedContent, denormalizedFeaturedImageUrl, canonicalUri);
        return AdminPostDetailDTO.from(content, voteStats);
    }

    private PersonalPostDetailDTO convertToProfilePostDetailDTO(Post post, VoteStatsDTO voteStats) {
        String denormalizedContent = markdownUtils.denormalizeImageUrlsInContent(post.getContent());
        String denormalizedFeaturedImageUrl = mediaUtils.buildMediaUrl(post.getFeaturedImage());
        URI canonicalUri = publicResourceUriFactory.post(post.getPublicUri(), true);
        PersonalPostDetailContentDTO content = PersonalPostDetailContentDTO.from(post, denormalizedContent, denormalizedFeaturedImageUrl, canonicalUri);
        return PersonalPostDetailDTO.from(content, voteStats);
    }
}
