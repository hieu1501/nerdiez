package com.tmb.csnerd.demo.domain.services.tag;

import com.tmb.csnerd.demo.domain.models.Tag;
import com.tmb.csnerd.demo.domain.repositories.tag.TagRepository;
import com.tmb.csnerd.demo.domain.repositories.tag.projections.TagDetailProjection;
import com.tmb.csnerd.demo.dto.tag.adminresponse.TagAdminDetailDTO;
import com.tmb.csnerd.demo.dto.tag.publicresponse.TagPublicDetailDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Component
public class TagContentLoader {
    private final TagRepository tagRepository;

    public List<TagAdminDetailDTO> loadTagsForAdmin() {
        List<TagDetailProjection> allTags = tagRepository.getAllTags();
        return allTags.stream().map(t -> TagAdminDetailDTO.from(t.id(), t.slug(), t.postUseCount(), t.topicUseCount(), t.isActive())).toList();
    }

    public List<TagPublicDetailDTO> loadTagsForPublic() {
        List<Tag> allActiveTags = tagRepository.getAllActiveTags();
        return allActiveTags.stream().map(TagPublicDetailDTO::from).toList();
    }
}
