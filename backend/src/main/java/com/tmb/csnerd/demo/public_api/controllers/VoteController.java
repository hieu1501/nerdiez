package com.tmb.csnerd.demo.public_api.controllers;

import com.tmb.csnerd.demo.domain.security.UserPrincipal;
import com.tmb.csnerd.demo.domain.services.auth.UserPrincipalService;
import com.tmb.csnerd.demo.domain.services.postvote.PostVoteService;
import com.tmb.csnerd.demo.dto.vote.PostVoteResponseDTO;
import com.tmb.csnerd.demo.dto.vote.SetPostVoteRequestDTO;
import com.tmb.csnerd.demo.exceptions.UnauthorizedException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/articles/{categorySlug}/{postSlugName}/vote")
public class VoteController {
    private final PostVoteService postVoteService;
    private final UserPrincipalService userPrincipalService;

    @PutMapping
    public ResponseEntity<PostVoteResponseDTO> setVote(@PathVariable String categorySlug, @PathVariable String postSlugName, @Valid @RequestBody SetPostVoteRequestDTO request, @AuthenticationPrincipal Jwt jwt) {
        UserPrincipal user = userPrincipalService.getUserBySubject(jwt.getSubject()).filter(UserPrincipal::isEnabled).orElseThrow(() -> new UnauthorizedException(HttpStatus.FORBIDDEN));
        PostVoteResponseDTO result = postVoteService.setVote(categorySlug, postSlugName, user, request.vote());
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .body(result);
    }
}
