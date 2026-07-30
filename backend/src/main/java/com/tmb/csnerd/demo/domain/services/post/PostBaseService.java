package com.tmb.csnerd.demo.domain.services.post;

import com.tmb.csnerd.demo.domain.models.Post;
import com.tmb.csnerd.demo.domain.models.PostsVote;
import com.tmb.csnerd.demo.dto.category.CategoryRefDTO;
import com.tmb.csnerd.demo.dto.post.AdminPostBriefDTO;
import com.tmb.csnerd.demo.dto.post.AdminPostDetailDTO;
import com.tmb.csnerd.demo.dto.post.PublicPostDetailDTO;
import com.tmb.csnerd.demo.dto.topic.TopicRefDTO;
import com.tmb.csnerd.demo.utils.MediaUtils;
import lombok.RequiredArgsConstructor;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.springframework.data.util.Pair;

import java.util.Set;
import java.util.stream.Collectors;

public class PostBaseService {
    protected final MediaUtils mediaUtils;

    public PostBaseService(MediaUtils mediaUtils) {
        this.mediaUtils = mediaUtils;
    }

    protected PublicPostDetailDTO convertToPublicPostDetailDTO(Post post) {
        Pair<Integer, Integer> voteResult = getVoteCount(post.getVotes());
        return new PublicPostDetailDTO(
            post.getId(),
            post.getTitle(),
            post.getSlug(),
            post.getContent(),
            post.getAuthor().getUsername(),
            new CategoryRefDTO(post.getCategory().getId(), post.getCategory().getName()),
            post.getCreatedAt(),
            post.getTopics().stream().map(topic -> new TopicRefDTO(topic.getId(), topic.getName())).collect(Collectors.toSet()),
            post.getPostMetadata().getFeaturedImage(),
            post.getPostMetadata().getDescription(),
            voteResult.getFirst(),
            voteResult.getSecond()
        );
    }

    protected AdminPostDetailDTO convertToAdminPostDetailDTO(Post post) {
        Pair<Integer, Integer> voteResult = getVoteCount(post.getVotes());
        return new AdminPostDetailDTO(
            post.getId(),
            post.getTitle(),
            buildImageUrlInHtmlContent(post.getContent()),
            post.getAuthor().getUsername(),
            new CategoryRefDTO(post.getCategory().getId(), post.getCategory().getName()),
            post.getCreatedAt(),
            post.getUpdatedAt(),
            post.getTopics().stream().map(topic -> new TopicRefDTO(topic.getId(), topic.getName())).collect(Collectors.toSet()),
            buildImageUrl(post.getPostMetadata().getFeaturedImage()),
            post.getPostMetadata().getDescription(),
            voteResult.getFirst(),
            voteResult.getSecond(),
            post.getIsActive()
        );
    }

    protected AdminPostBriefDTO convertToAdminPostBriefDTO(Post post) {
        Pair<Integer, Integer> voteResult = getVoteCount(post.getVotes());
        return new AdminPostBriefDTO(
                post.getId(),
                post.getTitle(),
                post.getAuthor().getUsername(),
                new CategoryRefDTO(post.getCategory().getId(), post.getCategory().getName()),
                post.getCreatedAt(),
                post.getUpdatedAt(),
                voteResult.getFirst(),
                voteResult.getSecond(),
                post.getIsActive()
        );
    }

    protected Pair<Integer, Integer> getVoteCount(Set<PostsVote> postsVote) {
        Integer upvotes = 0;
        Integer downvotes = 0;
        if (postsVote != null) {
            for (PostsVote vote : postsVote) {
                if (vote.getIsActive() && vote.getVote() != 0) {
                    if (vote.getVote() == 1) upvotes++;
                    if (vote.getVote() == -1) downvotes++;
                }
            }
        }
        return Pair.of(upvotes, downvotes);
    }

    private String buildImageUrl(String imageRelativePath) {
        return mediaUtils.buildMediaUrl(imageRelativePath);
    }

    private String buildImageUrlInHtmlContent(String content) {
        if (content == null || content.isBlank()) return content;
        Document doc = Jsoup.parseBodyFragment(content);
        doc.outputSettings().prettyPrint(false);

        for (Element img : doc.select("img[src]")) {
            String src = img.attr("src");
            if (!src.startsWith("http:") && !src.startsWith("https:")) {
                src = buildImageUrl(src);
                img.attr("src", src);
            }
        }
        return doc.toString();
    }
}
