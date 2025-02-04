package com.king.backend.s3.service;

import com.king.backend.domain.cast.entity.Cast;
import com.king.backend.domain.cast.repository.CastRepository;
import com.king.backend.domain.content.entity.Content;
import com.king.backend.domain.content.repository.ContentRepository;
import com.king.backend.global.exception.CustomException;
import com.king.backend.s3.errorcode.S3ErrorCode;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetUrlRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.net.URL;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class S3Service {
    private final S3Client s3Client;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ContentRepository contentRepository;
    private final CastRepository castRepository;

    @Value("${spring.aws.s3-bucket}")
    private String bucketName;
    
    // 1. 사용자가 직접 업로드

    // 단일 파일 업로드
    public String uploadFile(MultipartFile file) {
        return uploadToS3(file);
    }
    // 여러 파일 업로드
    public List<String> uploadFiles(List<MultipartFile> files) {
        return files.stream()
                .map(this::uploadToS3)
                .collect(Collectors.toList());
    }
    // 사용자가 업로드한 파일을 S3에 업로드
    private String uploadToS3(MultipartFile file) {
        String fileName = "uploads/" + UUID.randomUUID() + "-" + file.getOriginalFilename();

        PutObjectRequest request = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(fileName)
                .contentType(file.getContentType())
                .build();

        try {
            s3Client.putObject(request, RequestBody.fromBytes(file.getBytes()));
        } catch (IOException e) {
            throw new CustomException(S3ErrorCode.S3_UPLOAD_FAILED);
        }

        return getFileUrl(fileName);
    }
    // S3에 저장된 파일 URL 반환
    public String getFileUrl(String fileName) {
        GetUrlRequest request = GetUrlRequest.builder()
                .bucket(bucketName)
                .key(fileName)
                .build();
        URL url = s3Client.utilities().getUrl(request);
        return url.toString();
    }
    private String extractFileName(String imageUrl) {
        return imageUrl.substring(imageUrl.lastIndexOf("/") + 1);
    }

    
    // 2. tmdb 사진 업로드

    // 이미지(cast, content) 조회 (2가지 경우)
    @Transactional
    public String getOrUploadImage(Object entity){
        String imageUrl;

        if(entity instanceof Content){
            imageUrl = ((Content) entity).getImageUrl();
            log.info("Content 테이블에 저장된 imageUrl: {}", imageUrl);
        } else if (entity instanceof Cast){
            imageUrl = ((Cast) entity).getImageUrl();
            log.info("Cast 테이블에 저장된 imageUrl: {}", imageUrl);
        } else {
            throw new CustomException(S3ErrorCode.UNSUPPORTED_ENTITY_TYPE);
        }

        log.info("imageUrl 확인 완료: {}", imageUrl);

        // 1) DB에 TMDB url 저장되어 있으면 S3에 업로드 후 DB에 S3 주소 업데이트
        if(imageUrl.contains("image.tmdb.org")){
            // s3에 업로드 후 s3 주소 반환
            String s3ImageUrl = uploadTmdbImage(imageUrl);
            log.info("tmdbUrl {} -> s3ImageUrl 변환 완료: {}", imageUrl, s3ImageUrl);

            if (entity instanceof Content) {
                Content content = (Content) entity;
                content.setImageUrl(s3ImageUrl);
                contentRepository.save(content);
                log.info("새로운 s3ImageUrl {}로 content 업데이트 완료", content.getImageUrl());
            } else if (entity instanceof Cast) {
                Cast cast = (Cast) entity;
                cast.setImageUrl(s3ImageUrl);
                cast = castRepository.save(cast);
                log.info("새로운 s3ImageUrl {} 로 cast 업데이트 완료", cast.getImageUrl());
            } else {
                throw new CustomException(S3ErrorCode.UNSUPPORTED_ENTITY_TYPE);
            }

            return s3ImageUrl;
        }
        // 2) 이미 DB에 S3 주소가 저장되어 있으면 그대로 반환
        return imageUrl;
    }


    public String uploadTmdbImage(String tmdbUrl) {
        try {
            // TMDB 이미지 다운로드
            byte[] imageBytes = restTemplate.getForObject(tmdbUrl, byte[].class); 
            if (imageBytes == null || imageBytes.length == 0) {
                throw new CustomException(S3ErrorCode.TMDB_IMAGE_DOWNLOAD_FAILED);
            }

            String fileName = "uploads/" + UUID.randomUUID() + "-" + extractFileName(tmdbUrl);
            PutObjectRequest request = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(fileName)
                    .contentType("image/jpeg")
                    .build();

            s3Client.putObject(request, RequestBody.fromBytes(imageBytes));

            return getFileUrl(fileName);
        } catch (Exception e) {
            throw new CustomException(S3ErrorCode.TMDB_IMAGE_UPLOAD_FAILED);
        }
    }
}
