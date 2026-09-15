package com.tmb.csnerd.demo.public_api.controllers;

import com.tmb.csnerd.demo.domain.security.UserPrincipal;
import com.tmb.csnerd.demo.domain.services.auth.UserPrincipalService;
import com.tmb.csnerd.demo.domain.services.talk.TalkCommandService;
import com.tmb.csnerd.demo.dto.talk.publicresponse.PersonalTalkContentDTO;
import com.tmb.csnerd.demo.dto.talk.request.AdminCreateTalkRequestDTO;
import com.tmb.csnerd.demo.dto.talk.request.AdminPatchTalkRequestDTO;
import com.tmb.csnerd.demo.dto.talk.request.PublicCreateTalkRequestDTO;
import com.tmb.csnerd.demo.dto.talk.request.PublicPatchTalkRequestDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/talks")
public class TalkCommandController {
    private final TalkCommandService talkCommandService;
    private final UserPrincipalService userPrincipalService;

    @PostMapping(
        consumes = MediaType.APPLICATION_JSON_VALUE,
        produces = { MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE }
    )
    public ResponseEntity<PersonalTalkContentDTO> createTalk(@Valid @RequestBody PublicCreateTalkRequestDTO request, @AuthenticationPrincipal Jwt jwt) {
        UserPrincipal principal = userPrincipalService.convertJwtToUserPrincipal(jwt);
        PersonalTalkContentDTO talk = talkCommandService.createTalkForProfile(request, principal);
        return ResponseEntity.created(talk.canonicalUri()).body(talk);
    }

    @PatchMapping(
        path = "/{publicUri}",
        consumes = MediaType.APPLICATION_JSON_VALUE,
        produces = { MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE }
    )
    public ResponseEntity<PersonalTalkContentDTO> patchTalk(@PathVariable String publicUri, @Valid @RequestBody PublicPatchTalkRequestDTO request, @AuthenticationPrincipal Jwt jwt) {
        UserPrincipal principal = userPrincipalService.convertJwtToUserPrincipal(jwt);
        return ResponseEntity.ok(talkCommandService.patchTalkByPublicUri(publicUri, request, principal));
    }

    @DeleteMapping(
        path = "/{publicUri}"
    )
    public ResponseEntity<Void> delete(@PathVariable String publicUri, @AuthenticationPrincipal Jwt jwt) {
        UserPrincipal principal = userPrincipalService.convertJwtToUserPrincipal(jwt);
        talkCommandService.hardDeleteTalk(publicUri, principal);
        return ResponseEntity.noContent().build();
    }
}
