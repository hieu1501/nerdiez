package com.tmb.csnerd.demo.admin.controllers;

import com.tmb.csnerd.demo.domain.models.Image;
import com.tmb.csnerd.demo.domain.services.image.ImageService;
import com.tmb.csnerd.demo.dto.media.ImageResponseDTO;
import com.tmb.csnerd.demo.domain.services.media.MediaUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("admin/api/media")
@RequiredArgsConstructor
public class AdminMediaController {
    private final ImageService imageService;
    private final MediaUtils mediaUtils;


    @PostMapping("/upload")
    public ResponseEntity<ImageResponseDTO> uploadImage(@RequestParam("file") MultipartFile file) {
        Image image = imageService.saveImage(file);
        return ResponseEntity.ok(new ImageResponseDTO(mediaUtils.buildMediaUrl(image.getPath())));
    }
}
