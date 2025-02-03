package com.king.backend.global.common;

import com.king.backend.domain.cast.entity.Cast;
import com.king.backend.domain.cast.repository.CastRepository;
import com.king.backend.domain.content.entity.Content;
import com.king.backend.domain.content.repository.ContentRepository;
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
            throw new RuntimeException("S3 파일 업로드 실패", e); // 커스텀 에러로 변경
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

    ///////////////////////////


    // 이미지(cast, content) 조회 (2가지 경우)
//    @Transactional
//    public String getOrUploadImage(Object entity){
//        String imageUrl;
//
//        if(entity instanceof Content){
//            imageUrl = ((Content) entity).getImageUrl();
//            log.info("Content 테이블에 저장된 imageUrl: {}", imageUrl);
//        } else if (entity instanceof Cast){
//            imageUrl = ((Cast) entity).getImageUrl();
//            log.info("Cast 테이블에 저장된 imageUrl: {}", imageUrl);
//        } else {
//            throw new IllegalArgumentException("지원되지 않는 엔티티 타입"); // 커스텀...
//        }
//
//        log.info("imageUrl 확인 완료: {}", imageUrl);
//
//        // 1) DB에 TMDB url 저장되어 있으면 S3에 업로드 후 DB에 S3 주소 업데이트
//        if(imageUrl.contains("image.tmdb.org")){
//            // s3에 업로드 후 s3 주소 반환
////            String s3ImageUrl = uploadTmdbImage(imageUrl);
//            String s3ImageUrl = "s3ImageUrl test 주소!";
//            log.info("tmdbUrl {} -> s3ImageUrl 변환 완료: {}", imageUrl, s3ImageUrl);
//
//            if (entity instanceof Content) {
//                Content content = (Content) entity;
//                content.setImageUrl(s3ImageUrl);
//                contentRepository.save(content);
//                log.info("새로운 s3ImageUrl로 content 업데이트 완료");
//            } else if (entity instanceof Cast) {
//                Cast cast = (Cast) entity;
//                cast.setImageUrl(s3ImageUrl);
//                cast = castRepository.save(cast);
////                Cast result = (Cast) castRepository.findById(cast.getId()).orElse(null);
////                log.info("새로운 s3ImageUrl {} 로 cast 업데이트 완료", result.getImageUrl());
//                log.info("새로운 s3ImageUrl {} 로 cast 업데이트 완료", cast.getImageUrl());
//                // castImage가 저장이 안됨 저장이!
//            } else {
//                throw new IllegalArgumentException("지원되지 않는 엔티티 타입"); // 커스텀...
//            }
//
//            return s3ImageUrl;
//        }
//        // 2) 이미 DB에 S3 주소가 저장되어 있으면 그대로 반환
//        return imageUrl;
//    }

    @Transactional
    public String getOrUploadContentImage(Content content) {
        String imageUrl = content.getImageUrl();
        log.info("Content 테이블에 저장된 imageUrl: {}", imageUrl);

        if (imageUrl.contains("image.tmdb.org")) {
//            String s3ImageUrl = uploadTmdbImage(imageUrl);
            String s3ImageUrl = uploadTmdbImage("s3 test 주소!");
            content.setImageUrl(s3ImageUrl);
            contentRepository.save(content);
            log.info("새로운 s3ImageUrl로 content 업데이트 완료");
            log.info("content 객체 업데이트 : {}", content.toString());
            return s3ImageUrl;
        }
        return imageUrl;
    }

    @Transactional
    public String getOrUploadCastImage(Cast cast) {
        String imageUrl = cast.getImageUrl();
        log.info("Cast 테이블에 저장된 imageUrl: {}", imageUrl);

        if (imageUrl.contains("image.tmdb.org")) {
//            String s3ImageUrl = uploadTmdbImage(imageUrl);
            String s3ImageUrl = uploadTmdbImage("s3 test 주소!");
            cast.setImageUrl(s3ImageUrl);
            castRepository.save(cast);
            log.info("새로운 s3ImageUrl로 cast 업데이트 완료: {}", cast.getImageUrl());
            log.info("cast 객체 업데이트 : {}", cast.toString());
            return s3ImageUrl;
        }
        return imageUrl;
    }


    public String uploadTmdbImage(String tmdbUrl) {
        try {
            // TMDB 이미지 다운로드
            byte[] imageBytes = restTemplate.getForObject(tmdbUrl, byte[].class); 
            if (imageBytes == null || imageBytes.length == 0) {
                throw new RuntimeException("TMDB 이미지 다운로드 실패: " + tmdbUrl);
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
            throw new RuntimeException("TMDB 이미지 업로드 실패: " + tmdbUrl, e);
        }
    }
}
