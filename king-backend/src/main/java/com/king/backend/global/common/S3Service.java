package com.king.backend.global.common;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetUrlRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.net.URL;
import java.util.UUID;

@Service
public class S3Service {
    private final S3Client s3Client;

    @Value("${spring.aws.s3-bucket}")
    private String bucketName;

    public S3Service(S3Client s3Client) {
        this.s3Client = s3Client;
    }

    // 파일 업로드
    public String uploadFile(MultipartFile file) {
        String fileName = "uploads/" + UUID.randomUUID() + "-" + file.getOriginalFilename();

        PutObjectRequest request = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(fileName)
                .contentType(file.getContentType())
                .build();

        try {
            s3Client.putObject(request, RequestBody.fromBytes(file.getBytes()));
        } catch (IOException e) {
            throw new RuntimeException("S3 파일 업로드 실패", e); // 커스텀응답으로 변경
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
}
