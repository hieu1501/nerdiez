package com.tmb.csnerd.demo.domain.services.post;

import com.tmb.csnerd.demo.dto.post.AdminPostBriefDTO;
import com.tmb.csnerd.demo.dto.post.AdminPostDetailDTO;
import com.tmb.csnerd.demo.dto.post.PublicPostDetailDTO;
import com.tmb.csnerd.demo.domain.models.Post;
import com.tmb.csnerd.demo.domain.repositories.PostRepository;
import com.tmb.csnerd.demo.utils.MarkdownUtils;
import com.tmb.csnerd.demo.utils.MediaUtils;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class PostQueryService extends PostBaseService {
    private final PostRepository postRepository;
    private final Set<String> allowedSortFields = Set.of("createdAt", "updatedAt", "title");

    public PostQueryService(PostRepository postRepository,
                            MediaUtils mediaUtils,
                            MarkdownUtils markdownUtils) {
        super(mediaUtils, markdownUtils);
        this.postRepository = postRepository;
    }

    @Cacheable(value = "post-admin-list", key = "#pageable.pageNumber + ':' + #pageable.pageSize + ':' + #pageable.sort")
    public Page<AdminPostBriefDTO> getAllPostsPage(Pageable pageable) {
        Pageable safePageable = PageRequest.of(
            getSafePageNumber(pageable.getPageNumber()),
            getSafePageSize(pageable.getPageSize()),
            getSafeSort(pageable.getSort())
        );
        return postRepository.getAllPostBriefPage(safePageable);
    }

    public List<PublicPostDetailDTO> findRecentActivePosts() {
        List<Post> posts = postRepository.getCreatedDescActivePosts();
        return posts.stream()
                .map(this::convertToPublicPostDetailDTO)
                .toList();
    }

    public List<PublicPostDetailDTO> findUpvotedDescActivePosts() {
        List<Post> posts = postRepository.getUpvotesDescActivePosts();
        return posts.stream()
                .map(this::convertToPublicPostDetailDTO)
                .toList();
    }

    @Cacheable(value = "post-detail", key = "'admin:detail:' + #id")
    public AdminPostDetailDTO findPostForAdmin(Long id) {
        Post post = postRepository.findPostByPostId(id)
                .orElse(null);
        if (post == null) return null;
        return convertToAdminPostDetailDTO(post);
    }

    @Cacheable(value = "post-detail", key = "'public:detail:' + #id")
    public PublicPostDetailDTO findPublicPost(Long id) {
        Post post = postRepository.findActivePostByPostId(id)
                .orElse(null);
        if (post == null) return null;
        return convertToPublicPostDetailDTO(post);
    }

    private Integer getSafePageNumber(Integer pageNumber) {
        return Math.max(pageNumber, 0);
    }

    private Integer getSafePageSize(Integer pageSize) {
        return Math.min(Math.max(pageSize, 1), 100);
    }

    private Sort getSafeSort(Sort sort) {
        if (sort.isUnsorted()) {
            return Sort.by(Sort.Direction.DESC, "createdAt");
        }
        List<Sort.Order> validOrders = sort.stream()
                .filter(order -> allowedSortFields.contains(order.getProperty()))
                .toList();

        if (validOrders.size() != sort.stream().count()) {
            throw new IllegalArgumentException(
                    sort.stream().map(Sort.Order::getProperty).filter(p -> !allowedSortFields.contains(p)).collect(Collectors.joining(", "))
            );
        }
        return Sort.by(validOrders);
    }
}
