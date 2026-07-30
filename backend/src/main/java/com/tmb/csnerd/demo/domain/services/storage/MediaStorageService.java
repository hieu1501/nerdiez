package com.tmb.csnerd.demo.domain.services.storage;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface MediaStorageService {
    String storeImage(MultipartFile file) throws IOException;
    void deleteImage(String relativePath);
    void deleteImagesFromPath(List<String> paths);
    List<String> getAllStoredImages();
}
