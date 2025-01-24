package com.king.backend.domain.content.service;

import com.king.backend.domain.cast.entity.Cast;
import com.king.backend.domain.content.dto.response.ContentDetailResponseDto;
import com.king.backend.domain.content.entity.Content;
import com.king.backend.domain.content.entity.ContentCast;
import com.king.backend.domain.content.repository.ContentRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ContentService {
    private final ContentRepository contentRepository;

    @Transactional
    public ContentDetailResponseDto getContentDetail(Long id){
        Content content = contentRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("에러 발생"));
        List<ContentDetailResponseDto.RelatedCast> relatedCasts = content.getContentCasts().stream()
                .map(this::mapToRelatedCasts)
                .collect(Collectors.toList());

        return new ContentDetailResponseDto(
                content.getId(),
                content.getTranslationKo().getTitle(),
                content.getType(),
                content.getBroadcast(),
                content.getTranslationKo().getDescription(),
                content.getImageUrl(),
                content.getCreatedAt(),
                true,
                relatedCasts
        );
    }

    private ContentDetailResponseDto.RelatedCast mapToRelatedCasts(ContentCast contentCast) {
        Cast cast = contentCast.getCast();
        return new ContentDetailResponseDto.RelatedCast(
                cast.getId(),
                cast.getTranslationKo().getName(),
                cast.getImageUrl(),
                true
        );
    }
}
