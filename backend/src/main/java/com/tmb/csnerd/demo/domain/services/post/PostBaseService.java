package com.tmb.csnerd.demo.domain.services.post;

import com.tmb.csnerd.demo.domain.models.Post;
import com.tmb.csnerd.demo.domain.models.PostsVote;
import com.tmb.csnerd.demo.dto.category.CategoryRefDTO;
import com.tmb.csnerd.demo.dto.post.AdminPostBriefDTO;
import com.tmb.csnerd.demo.dto.post.AdminPostDetailDTO;
import com.tmb.csnerd.demo.dto.post.PublicPostDetailDTO;
import com.tmb.csnerd.demo.dto.topic.TopicRefDTO;
import com.tmb.csnerd.demo.utils.MarkdownUtils;
import com.tmb.csnerd.demo.utils.MediaUtils;
import org.commonmark.node.AbstractVisitor;
import org.commonmark.node.Image;
import org.commonmark.node.Node;
import org.springframework.data.domain.Sort;
import org.springframework.data.util.Pair;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

public class PostBaseService {
    protected final MediaUtils mediaUtils;
    protected MarkdownUtils markdownUtils;

    public PostBaseService(MediaUtils mediaUtils, MarkdownUtils markdownUtils) {
        this.markdownUtils = markdownUtils;
        this.mediaUtils = mediaUtils;
    }

    protected PublicPostDetailDTO convertToPublicPostDetailDTO(Post post) {
        String postContent = denormalizeImageUrlsInContent(post.getContent());
        String featuredImageUrl = buildImageUrl(post.getPostMetadata().getFeaturedImage());
        return PublicPostDetailDTO.from(post, postContent, featuredImageUrl);
    }

    protected AdminPostDetailDTO convertToAdminPostDetailDTO(Post post) {
        String postContent = denormalizeImageUrlsInContent(post.getContent());
        String featuredImageUrl = buildImageUrl(post.getPostMetadata().getFeaturedImage());
        return AdminPostDetailDTO.from(post, postContent, featuredImageUrl);
    }

    private String buildImageUrl(String imageRelativePath) {
        return mediaUtils.buildMediaUrl(imageRelativePath);
    }

    private String denormalizeImageUrlsInContent(String content) {
        Node document = markdownUtils.parseDocument(content);

        document.accept(new AbstractVisitor() {
            @Override
            public void visit(Image image) {
                String url = markdownUtils.denormalizeUrl(image.getDestination(), "image");
                if (url != null) {
                    image.setDestination(url);
                    super.visit(image);
                }
                else {
                    image.unlink();
                }
            }
        });
        return markdownUtils.renderDocument(document);
    }
}
