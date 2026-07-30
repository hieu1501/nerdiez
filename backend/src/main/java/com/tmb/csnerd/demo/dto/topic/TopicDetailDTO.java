package com.tmb.csnerd.demo.dto.topic;

import com.tmb.csnerd.demo.dto.category.CategoryRefDTO;

public record TopicDetailDTO(
    Long topicId,
    String name,
    String slugName,
    String description,
    CategoryRefDTO category
) { }
