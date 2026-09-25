package com.tmb.csnerd.demo.domain.services.storage;

import com.tmb.csnerd.demo.domain.services.media.MediaUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.exception.SdkException;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.Delete;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.DeleteObjectsRequest;
import software.amazon.awssdk.services.s3.model.DeleteObjectsResponse;
import software.amazon.awssdk.services.s3.model.ListObjectsV2Request;
import software.amazon.awssdk.services.s3.model.ObjectIdentifier;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Object;
import software.amazon.awssdk.services.s3.paginators.ListObjectsV2Iterable;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class R2MediaStorageService implements MediaStorageService {
    private static final int DELETE_BATCH_SIZE = 1000;

    private final S3Client s3Client;
    private final MediaUtils mediaUtils;
    private final String bucketName;
    Logger logger = LoggerFactory.getLogger(R2MediaStorageService.class);

    public R2MediaStorageService(S3Client s3Client, MediaUtils mediaUtils,
                                  @Value("${cloudflare.r2.bucket-name}") String bucketName) {
        this.s3Client = s3Client;
        this.mediaUtils = mediaUtils;
        this.bucketName = bucketName;
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

        String key = UUID.randomUUID() + ext;
        PutObjectRequest request = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .contentType(contentType)
                .contentLength(img.getSize())
                .cacheControl("public, max-age=31536000, immutable")
                .build();
        try {
            s3Client.putObject(request, RequestBody.fromInputStream(img.getInputStream(), img.getSize()));
        }
        catch (SdkException e) {
            throw new UncheckedIOException(new IOException("Failed to upload image to R2", e));
        }
        return key;
    }

    @Override
    public void deleteImage(String key) {
        try {
            s3Client.deleteObject(DeleteObjectRequest.builder().bucket(bucketName).key(key).build());
        }
        catch (SdkException e) {
            logger.error(e.getMessage(), e);
        }
    }

    @Override
    public void deleteImagesFromPath(List<String> paths) {
        if (paths.isEmpty()) return;
        for (int i = 0; i < paths.size(); i += DELETE_BATCH_SIZE) {
            List<String> chunk = paths.subList(i, Math.min(i + DELETE_BATCH_SIZE, paths.size()));
            List<ObjectIdentifier> objectIds = chunk.stream()
                    .map(key -> ObjectIdentifier.builder().key(key).build())
                    .toList();
            try {
                DeleteObjectsResponse response = s3Client.deleteObjects(DeleteObjectsRequest.builder()
                        .bucket(bucketName)
                        .delete(Delete.builder().objects(objectIds).build())
                        .build());
                if (!response.errors().isEmpty()) {
                    logger.error("Failed to delete {} objects from R2: {}", response.errors().size(), response.errors());
                }
            }
            catch (SdkException e) {
                logger.error(e.getMessage(), e);
            }
        }
    }

    @Override
    public List<String> getAllStoredImages() {
        List<String> allImages = new ArrayList<>();
        try {
            ListObjectsV2Iterable pages = s3Client.listObjectsV2Paginator(
                    ListObjectsV2Request.builder().bucket(bucketName).build());
            allImages.addAll(pages.contents().stream()
                    .map(S3Object::key)
                    .filter(key -> mediaUtils.extIsAllowed(mediaUtils.getExt(key)))
                    .collect(Collectors.toList()));
        }
        catch (SdkException e) {
            logger.error(e.getMessage(), e);
        }
        return allImages;
    }
}
