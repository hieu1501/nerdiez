package com.tmb.csnerd.demo.repositories;

import com.tmb.csnerd.demo.models.Topic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Set;

public interface TopicRepository extends JpaRepository<Topic, Long> {
    @Query("""
        SELECT t
        FROM Topic t
        WHERE t.id IN (:topicIds)
    """)
    List<Topic> findTopicsByIds(@Param("topicIds") Set<Long> topicIds);
}
