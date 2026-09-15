package com.tmb.csnerd.demo.domain.services.talk;

import com.tmb.csnerd.demo.domain.models.Talk;
import com.tmb.csnerd.demo.domain.repositories.talk.TalkRepository;
import com.tmb.csnerd.demo.domain.security.UserPrincipal;
import com.tmb.csnerd.demo.domain.services.publicuri.PublicResourceUriFactory;
import com.tmb.csnerd.demo.domain.services.vote.VoteService;
import com.tmb.csnerd.demo.dto.VoteStatsDTO;
import com.tmb.csnerd.demo.dto.talk.adminresponse.AdminTalkContentDTO;
import com.tmb.csnerd.demo.dto.talk.adminresponse.AdminTalkDTO;
import com.tmb.csnerd.demo.dto.talk.publicresponse.PersonalTalkContentDTO;
import com.tmb.csnerd.demo.dto.talk.request.AdminCreateTalkRequestDTO;
import com.tmb.csnerd.demo.dto.talk.request.AdminPatchTalkRequestDTO;
import com.tmb.csnerd.demo.dto.talk.request.PublicCreateTalkRequestDTO;
import com.tmb.csnerd.demo.dto.talk.request.PublicPatchTalkRequestDTO;
import com.tmb.csnerd.demo.exceptions.talk.TalkByPublicUriNotFoundException;
import com.tmb.csnerd.demo.utils.MarkdownUtils;
import com.tmb.csnerd.demo.domain.services.publicuri.PublicKeyGenerator;
import lombok.RequiredArgsConstructor;
import org.hibernate.exception.ConstraintViolationException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import java.net.URI;

@Service
@RequiredArgsConstructor
public class TalkCommandService {
    private static final int MAX_PUBLIC_URI_ATTEMPTS = 3;

    private final TalkTransactionalService talkTransactionalService;
    private final VoteService talkVoteService;
    private final PublicKeyGenerator publicKeyGenerator;
    private final MarkdownUtils markdownUtils;
    private final PublicResourceUriFactory publicResourceUriFactory;
    private final TalkRepository talkRepository;

    public AdminTalkDTO createTalkForAdmin(AdminCreateTalkRequestDTO request, UserPrincipal author) {
        Talk talk = createTalk(request, author);
        VoteStatsDTO voteStats = talkVoteService.DEFAULT_VOTE_STATS; // Newly created talk does not have vote information yet
        return convertToAdminTalkDetailDTO(talk, voteStats);
    }

    public PersonalTalkContentDTO createTalkForProfile(PublicCreateTalkRequestDTO request, UserPrincipal author) {
        Talk talk = createTalk(request, author);
        VoteStatsDTO voteStats = talkVoteService.DEFAULT_VOTE_STATS; // Newly created talk does not have vote information yet
        return convertToPersonalTalkDetailDTO(talk, voteStats, null);
    }

    public AdminTalkDTO patchTalkById(Long id, AdminPatchTalkRequestDTO request, UserPrincipal principal) {
        Talk talk = talkTransactionalService.patchTalkTransactional(id, request, principal);
        VoteStatsDTO voteStats = talkVoteService.getTalkVoteInformationByTalkId(id);
        return convertToAdminTalkDetailDTO(talk, voteStats);
    }

    public PersonalTalkContentDTO patchTalkByPublicUri(String publicUri, PublicPatchTalkRequestDTO request, UserPrincipal principal) {
        Long id = talkRepository.getActiveTalkIdByPublicUri(publicUri).orElseThrow(() -> new TalkByPublicUriNotFoundException(publicUri));
        Talk talk = talkTransactionalService.patchTalkTransactional(id, request, principal);
        VoteStatsDTO voteStats = talkVoteService.getTalkVoteInformationByTalkId(id);
        Byte userVote = talkVoteService.getVoteForTalkByUserId(id, principal.getUser().getId());
        return convertToPersonalTalkDetailDTO(talk, voteStats, userVote);
    }

    public void softDeleteTalk(Long id, UserPrincipal principal) {
        talkTransactionalService.softDeleteTalkTransactional(id, principal);
    }

    public void softDeleteTalk(String publicUri, UserPrincipal principal) {
        Long id = talkRepository.getActiveTalkIdByPublicUri(publicUri).orElseThrow(() -> new TalkByPublicUriNotFoundException(publicUri));
        talkTransactionalService.softDeleteTalkTransactional(id, principal);
    }

    public void hardDeleteTalk(Long id, UserPrincipal principal) {
        talkTransactionalService.hardDeleteTalkTransactional(id, principal);
    }

    public void hardDeleteTalk(String publicUri, UserPrincipal principal) {
        Long id = talkRepository.getActiveTalkIdByPublicUri(publicUri).orElseThrow(() -> new TalkByPublicUriNotFoundException(publicUri));
        talkTransactionalService.hardDeleteTalkTransactional(id, principal);
    }

    private Talk createTalk(AdminCreateTalkRequestDTO request, UserPrincipal principal) {
        for (int attempt = 0; attempt < MAX_PUBLIC_URI_ATTEMPTS; attempt++) {
            try {
                return talkTransactionalService.createTalkTransactional(request, principal, publicKeyGenerator.generate());
            } catch (DataIntegrityViolationException | ConstraintViolationException exception) {
                continue;
            }
        }
        throw new IllegalStateException("Unable to generate a unique Talk public URI");
    }

    private Talk createTalk(PublicCreateTalkRequestDTO request, UserPrincipal principal) {
        for (int attempt = 0; attempt < MAX_PUBLIC_URI_ATTEMPTS; attempt++) {
            try {
                return talkTransactionalService.createTalkTransactional(request, principal, publicKeyGenerator.generate());
            } catch (DataIntegrityViolationException | ConstraintViolationException exception) {
                continue;
            } catch (RuntimeException e) {
                int a = 1;
            }
        }
        throw new IllegalStateException("Unable to generate a unique Talk public URI");
    }

    private AdminTalkDTO convertToAdminTalkDetailDTO(Talk talk, VoteStatsDTO voteStats) {
        String content = markdownUtils.denormalizeImageUrlsInContent(talk.getContent());
        URI canonicalUri = publicResourceUriFactory.talk(talk.getPublicUri(), false);
        return new AdminTalkDTO(AdminTalkContentDTO.from(talk, content, canonicalUri), voteStats);
    }

    private PersonalTalkContentDTO convertToPersonalTalkDetailDTO(Talk talk, VoteStatsDTO voteStats, Byte viewerVote) {
        String content = markdownUtils.denormalizeImageUrlsInContent(talk.getContent());
        URI canonicalUri = publicResourceUriFactory.talk(talk.getPublicUri(), true);
        return PersonalTalkContentDTO.from(talk, content, canonicalUri);
    }
}
