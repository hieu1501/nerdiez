package com.tmb.csnerd.demo.public_api.controllers;

import com.tmb.csnerd.demo.domain.security.UserPrincipal;
import com.tmb.csnerd.demo.domain.services.auth.UserPrincipalService;
import com.tmb.csnerd.demo.domain.services.vote.VoteService;
import com.tmb.csnerd.demo.dto.postvote.PostVoteResponseDTO;
import com.tmb.csnerd.demo.dto.postvote.SetPostVoteRequestDTO;
import com.tmb.csnerd.demo.dto.talkvote.SetTalkVoteRequestDTO;
import com.tmb.csnerd.demo.dto.talkvote.TalkVoteResponseDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class VoteController {
    private final VoteService voteService;
    private final UserPrincipalService userPrincipalService;

    @PutMapping(
        path = "/api/articles/{publicUri}/vote",
        produces = { MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE }
    )
    public ResponseEntity<PostVoteResponseDTO> setVoteForPost(@PathVariable String publicUri, @Valid @RequestBody SetPostVoteRequestDTO request, @AuthenticationPrincipal Jwt jwt) {
        UserPrincipal user = userPrincipalService.convertJwtToUserPrincipal(jwt);
        PostVoteResponseDTO result = voteService.setPostVoteByPublicUri(publicUri, user, request.vote());
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .body(result);
    }

    @PutMapping(
        path = "/api/talks/{publicUri}/vote",
        produces = { MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE }
    )
    public ResponseEntity<TalkVoteResponseDTO> setVoteForTalk(@PathVariable String publicUri, @Valid @RequestBody SetTalkVoteRequestDTO request, @AuthenticationPrincipal Jwt jwt) {
        UserPrincipal user = userPrincipalService.convertJwtToUserPrincipal(jwt);
        TalkVoteResponseDTO result = voteService.setTalkVoteByPublicUri(publicUri, user, request.vote());
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .body(result);
    }
}
