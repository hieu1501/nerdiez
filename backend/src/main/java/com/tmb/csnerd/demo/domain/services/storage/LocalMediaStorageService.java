package com.tmb.csnerd.demo.domain.services.storage;

import com.tmb.csnerd.demo.utils.MediaUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;
import java.util.stream.Stream;

@Service
public class LocalMediaStorageService implements MediaStorageService {
    private final Path root;
    private final MediaUtils mediaUtils;
    Logger logger = LoggerFactory.getLogger(LocalMediaStorageService.class);

    public LocalMediaStorageService(MediaUtils mediaUtils, @Value("${app.upload.dir}") String uploadDir) throws IOException {
        this.root = Paths.get(uploadDir).toAbsolutePath().normalize();
        Files.createDirectories(this.root);
        this.mediaUtils = mediaUtils;
    }

    @Override
    public String storeImage(MultipartFile img) throws IOException {
        if (img.isEmpty()) {
            throw new IllegalArgumentException("Empty file");
        }
        String contentType = img.getContentType();
        if (contentType == null || !contentType.startsWith("image")) {
            throw new IllegalArgumentException("File type not supported: " + contentType);
        }
        String ext = mediaUtils.getExt(img.getOriginalFilename());
        if (!mediaUtils.extIsAllowed(ext)) {
            throw new IllegalArgumentException("File type not supported: " + ext);
        }

        String filename = UUID.randomUUID() + ext;
        Path destination = root.resolve(filename).normalize();
        if (!destination.startsWith(root)) {
            throw new SecurityException("Invalid path");
        }
        Path tmp = destination.resolveSibling(destination.getFileName() + ".tmp");
        Files.copy(img.getInputStream(), tmp, StandardCopyOption.REPLACE_EXISTING);
        Files.move(tmp, destination, StandardCopyOption.ATOMIC_MOVE, StandardCopyOption.REPLACE_EXISTING);
        return root.relativize(destination).toString().replace('\\', '/');
    }

    @Override
    public void deleteImage(String relativePath) {
        try {
            Path target = root.resolve(relativePath);
            if (!target.startsWith(root)) return;
            Files.deleteIfExists(target);
        }
        catch (IOException e) {
            logger.error(e.getMessage(), e);
        }
    }

    @Override
    public void deleteImagesFromPath(List<String> paths) {
        for (String path : paths) {
            deleteImage(path);
        }
    }

    @Override
    public List<String> getAllStoredImages() {
        List<String> allImages = List.of();
        try (Stream<Path> result = Files.walk(root)) {
            allImages = result.filter(Files::isRegularFile)
                    .filter(p -> mediaUtils.extIsAllowed(mediaUtils.getExt(p.getFileName().toString())))
                    .map(p -> root.relativize(p).toString().replace('\\', '/'))
                    .toList();
        }
        catch (IOException e) {
            logger.error(e.getMessage(), e);
        }
        return allImages;
    }
}
