package com.tmb.csnerd.demo.public_api.controllers;

import com.tmb.csnerd.demo.domain.security.UserPrincipal;
import com.tmb.csnerd.demo.domain.services.auth.UserPrincipalService;
import com.tmb.csnerd.demo.domain.services.topic.TopicCommandService;
import com.tmb.csnerd.demo.dto.topic.publicresponse.TopicPersonalDetailDTO;
import com.tmb.csnerd.demo.dto.topic.request.PublicCreateTopicRequestDTO;
import com.tmb.csnerd.demo.dto.topic.request.PublicPatchTopicRequestDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/topics")
public class TopicCommandController {
    private TopicCommandService topicCommandService;
    private UserPrincipalService userPrincipalService;

    @PostMapping(
        consumes = MediaType.APPLICATION_JSON_VALUE,
        produces = { MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE }
    )
    public ResponseEntity<TopicPersonalDetailDTO> createTopic(@Valid @RequestBody PublicCreateTopicRequestDTO request, @AuthenticationPrincipal Jwt jwt) {
        UserPrincipal principal = userPrincipalService.convertJwtToUserPrincipal(jwt);
        return ResponseEntity.ok(topicCommandService.createTopicForProfile(request, principal));
    }

    @PatchMapping(
        path = "/{publicUri}",
        consumes = MediaType.APPLICATION_JSON_VALUE,
        produces = { MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE }
    )
    public ResponseEntity<TopicPersonalDetailDTO> patchTopic(@PathVariable String publicUri, @Valid @RequestBody PublicPatchTopicRequestDTO request, @AuthenticationPrincipal Jwt jwt) {
        UserPrincipal principal = userPrincipalService.convertJwtToUserPrincipal(jwt);
        return ResponseEntity.ok(topicCommandService.patchTopicByPublicUri(publicUri, request, principal));
    }

    @DeleteMapping(
        path = "/{publicUri}"
    )
    public ResponseEntity<Void> deleteTopic(@PathVariable String publicUri, @AuthenticationPrincipal Jwt jwt) {
        UserPrincipal principal = userPrincipalService.convertJwtToUserPrincipal(jwt);
        topicCommandService.hardDeleteTopic(publicUri, principal);
        return ResponseEntity.noContent().build();
    }
}
