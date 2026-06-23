package com.tmb.csnerd.demo.services.topic;

import com.tmb.csnerd.demo.dto.topic.CreateTopicDTO;
import com.tmb.csnerd.demo.dto.topic.ReplaceTopicDTO;
import com.tmb.csnerd.demo.dto.topic.TopicResponseDTO;
import com.tmb.csnerd.demo.dto.topic.UpdateTopicDTO;
import com.tmb.csnerd.demo.exceptions.ConflictStatusException;
import com.tmb.csnerd.demo.exceptions.topic.TopicNotFound;
import com.tmb.csnerd.demo.models.Topic;
import com.tmb.csnerd.demo.repositories.PostRepository;
import com.tmb.csnerd.demo.repositories.TopicRepository;
import com.tmb.csnerd.demo.repositories.UserRepository;
import com.tmb.csnerd.demo.utils.SlugifyUtils;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@AllArgsConstructor
@Service
public class TopicCommandService {
    private final TopicRepository topicRepository;
    private final UserRepository userRepository;
    private final PostRepository postRepository;

    @Transactional
    public TopicResponseDTO createTopic(CreateTopicDTO request) {
        Topic topic = new Topic();
        topic.setName(request.name());
        topic.setSlugName(SlugifyUtils.slugify(request.name()));
        return convertToTopicResponseDTO(topicRepository.save(topic));
    }

    @Transactional
    public TopicResponseDTO patchTopic(Long topicId, UpdateTopicDTO request) {
        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new TopicNotFound(topicId));
        if (topic.getName() != null && !topic.getName().isEmpty() && !topic.getName().equals(request.name())) {
            topic.setName(request.name());
            topic.setSlugName(SlugifyUtils.slugify(request.name()));
        }
        return convertToTopicResponseDTO(topic);
    }

    @Transactional
    public TopicResponseDTO putTopic(Long topicId, ReplaceTopicDTO request) {
        Topic topic = topicRepository.findById(topicId)
                .orElse(null);
        if (topic == null) {
            topic = new Topic();
            topicRepository.save(topic);
        }
        topic.setName(request.name());
        topic.setSlugName(SlugifyUtils.slugify(request.name()));
        return convertToTopicResponseDTO(topic);
    }

    @Transactional
    public void deleteTopic(Long topicId) {
        Topic topic = topicRepository.findById(topicId)
            .orElseThrow(() -> new TopicNotFound(topicId));
        if (postRepository.existsActiveByTopicId(topicId)) {
            throw new ConflictStatusException("Topic is used by active posts");
        }
        topicRepository.delete(topic);
    }

    TopicResponseDTO convertToTopicResponseDTO(Topic topic) {
        return new TopicResponseDTO(topic.getName(), topic.getSlugName());
    }
}
