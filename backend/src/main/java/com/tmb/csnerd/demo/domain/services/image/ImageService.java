package com.tmb.csnerd.demo.domain.services.image;

import com.tmb.csnerd.demo.domain.models.Image;
import com.tmb.csnerd.demo.domain.models.Post;
import com.tmb.csnerd.demo.domain.repositories.ImageRepository;
import com.tmb.csnerd.demo.domain.services.storage.MediaStorageService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class ImageService {
    final ImageRepository imageRepository;
    final MediaStorageService mediaStorageService;
    Logger logger = LoggerFactory.getLogger(ImageService.class);

    @Transactional
    public Image saveImage(MultipartFile file) {
        String path = null;
        Image image = null;
        try {
            path = mediaStorageService.storeImage(file);
            image = new Image();
            image.setPath(path);
            image.setCreatedAt(Instant.now());
            image = imageRepository.save(image);
        }
        catch (Exception e) {
            if (path != null) {
                mediaStorageService.deleteImage(path);
            }
            throw (e instanceof RuntimeException re) ? re : new UncheckedIOException((IOException) e);
        }
        return image;
    }

    @Transactional
    public void setImagesInUse(Set<String> imagePaths) {
        int count = 0;
        if (!imagePaths.isEmpty()) {
            count = imageRepository.setImagesInUse(List.copyOf(imagePaths));
        }
        logger.debug("setImagesInUse count={}", count);
    }

    @Transactional
    public void setImagesNotInUse(Set<String> imagePaths) {
        int count = 0;
        if (!imagePaths.isEmpty()) {
            count = imageRepository.setImagesNotInUse(List.copyOf(imagePaths));
        }
        logger.debug("setImagesNotInUse count={}", count);
    }

    @Transactional
    public void updateImagesUseCount(Set<String> newImagePaths, Set<String> currentImagePaths) {
        List<String> imagePathsToAdd = new ArrayList<>(newImagePaths);
        imagePathsToAdd.removeAll(currentImagePaths);
        List<String> imagePathsToRemove = new ArrayList<>(currentImagePaths);
        imagePathsToRemove.removeAll(newImagePaths);
        int newCount = imageRepository.setImagesInUse(imagePathsToAdd);
        int deleteCount = imageRepository.setImagesNotInUse(imagePathsToRemove);
        logger.debug("updateImagesLinkedToPost newCount={}", newCount);
        logger.debug("updateImagesLinkedToPost deleteCount={}", deleteCount);
    }
}
