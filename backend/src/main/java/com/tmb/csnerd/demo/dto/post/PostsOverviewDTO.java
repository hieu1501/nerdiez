package com.tmb.csnerd.demo.dto.post;

import java.util.List;

public record PostsOverviewDTO(
        List<PostItemDTO> recentArticles,
        List<PostItemDTO> mostViewedArticles,
        List<PostItemDTO> featuredArticles
) {
}
