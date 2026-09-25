package com.tmb.csnerd.demo.public_api.controllers;

import com.tmb.csnerd.demo.domain.models.Image;
import com.tmb.csnerd.demo.domain.security.UserPrincipal;
import com.tmb.csnerd.demo.domain.services.auth.UserPrincipalService;
import com.tmb.csnerd.demo.domain.services.image.ImageService;
import com.tmb.csnerd.demo.domain.services.image.UploadRateLimiter;
import com.tmb.csnerd.demo.domain.services.media.MediaUtils;
import com.tmb.csnerd.demo.dto.media.ImageResponseDTO;
import com.tmb.csnerd.demo.exceptions.UnauthorizedException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/media")
@RequiredArgsConstructor
public class MediaController {
    private final ImageService imageService;
    private final MediaUtils mediaUtils;
    private final UserPrincipalService userPrincipalService;
    private final UploadRateLimiter uploadRateLimiter;

    @PostMapping("/upload")
    public ResponseEntity<ImageResponseDTO> uploadImage(@RequestParam("file") MultipartFile file, @AuthenticationPrincipal Jwt jwt) {
        UserPrincipal userPrincipal = userPrincipalService.convertJwtToUserPrincipal(jwt);
        if (userPrincipal == null) throw new UnauthorizedException(HttpStatus.UNAUTHORIZED);
        uploadRateLimiter.acquire(userPrincipal.getUser().getId());
        Image image = imageService.saveImage(file);
        return ResponseEntity.ok(new ImageResponseDTO(mediaUtils.buildMediaUrl(image.getPath())));
    }
}
