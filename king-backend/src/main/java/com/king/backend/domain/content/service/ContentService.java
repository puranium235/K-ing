package com.king.backend.domain.content.service;

import com.king.backend.domain.cast.entity.Cast;
import com.king.backend.domain.content.dto.response.ContentDetailResponseDto;
import com.king.backend.domain.content.entity.Content;
import com.king.backend.domain.content.entity.ContentCast;
import com.king.backend.domain.content.errorcode.ContentErrorCode;
import com.king.backend.domain.content.repository.ContentRepository;
import com.king.backend.s3.service.S3Service;
import com.king.backend.global.exception.CustomException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ContentService {
    private final ContentRepository contentRepository;
    private final S3Service s3Service;

    @Transactional
    public ContentDetailResponseDto getContentDetail(Long id){
        Content content = contentRepository.findById(id).orElseThrow(() -> new CustomException(ContentErrorCode.CONTENT_NOT_FOUND));

        String imageUrl = s3Service.getOrUploadImage(content);

        List<ContentDetailResponseDto.RelatedCast> relatedCasts = content.getContentCasts().stream()
                .map(this::mapToRelatedCasts)
                .collect(Collectors.toList());

        return new ContentDetailResponseDto(
                content.getId(),
                content.getTranslationKo().getTitle(),
                content.getType(),
                content.getBroadcast(),
                content.getTranslationKo().getDescription(),
                imageUrl,
                content.getCreatedAt(),
                true,
                relatedCasts
        );
    }

    private ContentDetailResponseDto.RelatedCast mapToRelatedCasts(ContentCast contentCast) {
        Cast cast = contentCast.getCast();

        String castImageUrl = s3Service.getOrUploadImage(cast);

        return new ContentDetailResponseDto.RelatedCast(
                cast.getId(),
                cast.getTranslationKo().getName(),
                castImageUrl,
                true
        );
    }
}
