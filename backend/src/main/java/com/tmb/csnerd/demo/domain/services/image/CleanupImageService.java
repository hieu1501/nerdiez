package com.tmb.csnerd.demo.domain.services.image;

import com.tmb.csnerd.demo.domain.models.Image;
import com.tmb.csnerd.demo.domain.repositories.ImageRepository;
import com.tmb.csnerd.demo.domain.services.storage.MediaStorageService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CleanupImageService {
    private final ImageRepository imageRepository;
    private final MediaStorageService mediaStorageService;
    Logger log = LoggerFactory.getLogger(CleanupImageService.class);

    @Scheduled(cron = "${app.schedule.images-disk-cleanup}")
    @Transactional
    public void deleteStaleImagesOnScheduled() {
        deleteStaleImagesInDatabase();
        deleteStaleImagesOnDisk();
    }

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void deleteStaleImagesOnServerStart() {
        deleteStaleImagesInDatabase();
        deleteStaleImagesOnDisk();
    }

    private void deleteStaleImagesInDatabase() {
        List<Image> staleImages = imageRepository.findStaleImages(Instant.now());
        if (!staleImages.isEmpty()) {
            int count = imageRepository.deleteImagesFromList(staleImages.stream().map(Image::getPath).toList());
            log.info("Deleted " + count + " stale images from database");
        }
    }

    private void deleteStaleImagesOnDisk() {
        List<String> unusedImages = new ArrayList<>(mediaStorageService.getAllStoredImages());
        List<String> allImagesInDatabase = imageRepository.getAllImagePaths();
        unusedImages.removeAll(allImagesInDatabase);
        mediaStorageService.deleteImagesFromPath(unusedImages);
        log.info("Deleted " + unusedImages.size() + " stale images on disk");
    }
}
