package com.tmb.csnerd.demo.domain.services.tag;

import com.tmb.csnerd.demo.domain.models.Tag;
import com.tmb.csnerd.demo.domain.repositories.tag.TagRepository;
import com.tmb.csnerd.demo.dto.common.CachedContent;
import com.tmb.csnerd.demo.dto.common.ETagResponse;
import com.tmb.csnerd.demo.dto.tag.adminresponse.TagAdminDetailDTO;
import com.tmb.csnerd.demo.dto.tag.publicresponse.TagPublicDetailDTO;
import com.tmb.csnerd.demo.domain.services.cache.ETagFactory;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@AllArgsConstructor
@Service
public class TagQueryService {
    private final TagCacheableService tagCacheableService;
    private final ETagFactory eTagFactory;
    private final TagRepository tagRepository;

    public ETagResponse<List<TagAdminDetailDTO>> getAllTagsForAdmin() {
        CachedContent<List<TagAdminDetailDTO>> listContent = tagCacheableService.getTagsListForAdmin();
        List<String> componentsForETag = new ArrayList<>();
        componentsForETag.add("admin-tag-list:v1");
        componentsForETag.add(listContent.fingerprint());
        String eTag = eTagFactory.weakETag(componentsForETag.toArray(String[]::new));
        return ETagResponse.from(listContent.content(), eTag);
    }

    public ETagResponse<List<TagPublicDetailDTO>> getAllTagsForPublic() {
        CachedContent<List<TagPublicDetailDTO>> listContent = tagCacheableService.getTagsListForPublic();
        List<String> componentsForETag = new ArrayList<>();
        componentsForETag.add("public-tag-list:v1");
        componentsForETag.add(listContent.fingerprint());
        String eTag = eTagFactory.weakETag(componentsForETag.toArray(String[]::new));
        return ETagResponse.from(listContent.content(), eTag);
    }

    public Set<Tag> getTagsByIds(Set<Long> ids) {
        return tagRepository.getTagsByIds(ids);
    }

    public Set<Tag> getActiveTagsBySlugNames(Set<String> slugs) {
        return tagRepository.getActiveTagsBySlugNames(slugs);
    }
}
