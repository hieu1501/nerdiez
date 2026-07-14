package com.tmb.csnerd.demo.dto.topic;

public record TopicResponseDTO(
    Long topicId,
    String name,
    String slugName,
    String description,
    Long categoryId,
    String categoryName
) { }
