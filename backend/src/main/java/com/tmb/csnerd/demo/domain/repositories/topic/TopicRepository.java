package com.tmb.csnerd.demo.domain.repositories.topic;

import com.tmb.csnerd.demo.domain.models.Topic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface TopicRepository extends JpaRepository<Topic, Long> {
    @Query("""
        SELECT t FROM Topic t
        JOIN FETCH t.category c
        WHERE c.id IN :categoryIds
    """)
    List<Topic> getAllTopicsByCategoryIds(List<Long> categoryIds);

    @Query("""
        SELECT t FROM Topic t
        JOIN FETCH t.category c
        WHERE t.isActive = true AND c.id IN :categoryIds
    """)
    List<Topic> getAllActiveTopicsByCategoryIds(List<Long> categoryIds);
}
