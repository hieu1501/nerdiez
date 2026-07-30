package com.tmb.csnerd.demo.dto.topic;

import com.tmb.csnerd.demo.dto.category.CategoryRefDTO;

public record TopicRefDTO(
    Long topicId,
    String name
) { }
