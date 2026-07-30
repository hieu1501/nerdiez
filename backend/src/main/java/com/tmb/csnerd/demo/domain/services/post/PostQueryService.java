package com.tmb.csnerd.demo.domain.services.post;

import com.tmb.csnerd.demo.dto.post.AdminPostBriefDTO;
import com.tmb.csnerd.demo.dto.post.AdminPostDetailDTO;
import com.tmb.csnerd.demo.dto.post.PublicPostDetailDTO;
import com.tmb.csnerd.demo.domain.models.Post;
import com.tmb.csnerd.demo.domain.repositories.PostRepository;
import com.tmb.csnerd.demo.utils.MediaUtils;
import lombok.AllArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.util.Pair;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class PostQueryService extends PostBaseService{
    private final PostRepository postRepository;

    public PostQueryService(PostRepository postRepository, MediaUtils mediaUtils) {
        super(mediaUtils);
        this.postRepository = postRepository;
    }

    @Cacheable(value = "post-admin", key = "'all'")
    public List<AdminPostBriefDTO> getAllPostsForAdmin() {
        List<Post> posts = postRepository.getAllArticlesForAdmin();
        return posts.stream()
                .map(this::convertToAdminPostBriefDTO)
                .toList();
    }

    public List<PublicPostDetailDTO> findRecentActivePosts() {
        List<Post> posts = postRepository.findCreatedDescActivePosts();
        return posts.stream()
                .map(this::convertToPublicPostDetailDTO)
                .toList();
    }

    public List<PublicPostDetailDTO> findUpvotedDescActivePosts() {
        List<Post> posts = postRepository.findUpvotesDescActivePosts();
        return posts.stream()
                .map(this::convertToPublicPostDetailDTO)
                .toList();
    }

    @Cacheable(value = "post-admin", key = "#id")
    public AdminPostDetailDTO findPostForAdmin(Long id) {
        Post post = postRepository.findPostByPostId(id)
                .orElse(null);
        if (post == null) return null;
        return convertToAdminPostDetailDTO(post);
    }

    @Cacheable(value = "post-public", key = "#id")
    public PublicPostDetailDTO findPublicPost(Long id) {
        Post post = postRepository.findActivePostByPostId(id)
                .orElse(null);
        if (post == null) return null;
        return convertToPublicPostDetailDTO(post);
    }
}
