package com.tmb.csnerd.demo.dto.post;

import java.util.List;

public record PublicOverviewPostsDTO(
        List<PublicPostDetailDTO> recentArticles,
        List<PublicPostDetailDTO> mostViewedArticles,
        List<PublicPostDetailDTO> featuredArticles
) {
}
