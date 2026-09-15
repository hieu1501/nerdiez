package com.tmb.csnerd.demo.domain.services.talk;

import com.tmb.csnerd.demo.domain.repositories.talk.TalkRepository;
import com.tmb.csnerd.demo.domain.repositories.talk.projections.AdminTalkContentProjection;
import com.tmb.csnerd.demo.domain.repositories.talk.projections.ProfileTalkContentProjection;
import com.tmb.csnerd.demo.domain.repositories.talk.projections.PublicTalkContentProjection;
import com.tmb.csnerd.demo.domain.services.fingerprint.FingerprintService;
import com.tmb.csnerd.demo.domain.services.fingerprint.IFingerprintData;
import com.tmb.csnerd.demo.domain.services.publicuri.PublicResourceUriFactory;
import com.tmb.csnerd.demo.dto.category.adminresponse.CategoryAdminRefDTO;
import com.tmb.csnerd.demo.dto.category.publicresponse.CategoryPublicRefDTO;
import com.tmb.csnerd.demo.dto.common.CachedContent;
import com.tmb.csnerd.demo.dto.talk.adminresponse.AdminTalkContentDTO;
import com.tmb.csnerd.demo.dto.talk.publicresponse.PersonalTalkContentDTO;
import com.tmb.csnerd.demo.dto.talk.publicresponse.PublicTalkContentDTO;
import com.tmb.csnerd.demo.dto.topic.adminresponse.TopicAdminRefDTO;
import com.tmb.csnerd.demo.dto.topic.publicresponse.TopicPublicRefDTO;
import com.tmb.csnerd.demo.dto.user.UserRefDTO;
import com.tmb.csnerd.demo.utils.MarkdownUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class TalkContentLoader {
    private final TalkRepository talkRepository;
    private final FingerprintService fingerprintService;
    private final MarkdownUtils markdownUtils;
    private final PublicResourceUriFactory publicResourceUriFactory;

    public Map<Long, CachedContent<AdminTalkContentDTO>> loadAdminContentByIds(Set<Long> ids) {
        Map<Long, CachedContent<AdminTalkContentDTO>> result = new HashMap<>();
        for (AdminTalkContentProjection talk : talkRepository.getAdminTalkContentByIds(ids)) {
            CategoryAdminRefDTO category = CategoryAdminRefDTO.from(talk.getCategoryId(), talk.getCategoryName(), talk.getCategorySlug());
            URI canonicalUri = publicResourceUriFactory.talk(talk.getPublicUri(), false);
            AdminTalkContentDTO content = new AdminTalkContentDTO(
                    talk.getId(),
                    talk.getContent(),
                    UserRefDTO.from(talk.getAuthorName()),
                    TopicAdminRefDTO.from(talk.getTopicId(), talk.getTopicName(), talk.getTopicSlug(), category),
                    talk.getCreatedAt(),
                    talk.getUpdatedAt(),
                    talk.getIsActive(),
                    canonicalUri
            );
            result.put(talk.getId(), cached(content, content.getFingerprintData()));
        }
        return Map.copyOf(result);
    }

    public Map<Long, CachedContent<PublicTalkContentDTO>> loadPublicContentByIds(Set<Long> ids) {
        Map<Long, CachedContent<PublicTalkContentDTO>> result = new HashMap<>();
        for (PublicTalkContentProjection talk : talkRepository.getPublicTalkContentByIds(ids)) {
            CategoryPublicRefDTO category = CategoryPublicRefDTO.from(talk.getCategoryName(), talk.getCategorySlug());
            URI canonicalUri = publicResourceUriFactory.talk(talk.getPublicUri(), false);
            PublicTalkContentDTO content = new PublicTalkContentDTO(
                    talk.getContent(),
                    UserRefDTO.from(talk.getAuthorName()),
                    TopicPublicRefDTO.from(talk.getTopicName(), talk.getTopicSlug(), category),
                    talk.getCreatedAt(),
                    talk.getUpdatedAt(),
                    canonicalUri
            );
            result.put(talk.getId(), cached(content, content.getFingerprintData()));
        }
        return Map.copyOf(result);
    }

    public Map<Long, CachedContent<PersonalTalkContentDTO>> loadProfileContentByIds(Set<Long> ids) {
        Map<Long, CachedContent<PersonalTalkContentDTO>> result = new HashMap<>();
        for (ProfileTalkContentProjection talk : talkRepository.getProfileTalkContentByIds(ids)) {
            CategoryPublicRefDTO category = CategoryPublicRefDTO.from(talk.getCategoryName(), talk.getCategorySlug());
            URI canonicalUri = publicResourceUriFactory.talk(talk.getPublicUri(), true);
            PersonalTalkContentDTO content = new PersonalTalkContentDTO(
                    talk.getContent(),
                    TopicPublicRefDTO.from(talk.getTopicName(), talk.getTopicSlug(), category),
                    talk.getCreatedAt(),
                    talk.getUpdatedAt(),
                    talk.getIsActive(),
                    canonicalUri
            );
            result.put(talk.getId(), cached(content, content.getFingerprintData()));
        }
        return Map.copyOf(result);
    }

    private <T> CachedContent<T> cached(T content, IFingerprintData fingerprintData) {
        return new CachedContent<>(content, fingerprintService.fingerprint(fingerprintData));
    }
}
