package com.king.backend.domain.content.service;

import com.king.backend.domain.cast.entity.Cast;
import com.king.backend.domain.cast.entity.CastTranslation;
import com.king.backend.domain.content.dto.response.ContentDetailResponseDto;
import com.king.backend.domain.content.entity.Content;
import com.king.backend.domain.content.entity.ContentCast;
import com.king.backend.domain.content.entity.ContentTranslation;
import com.king.backend.domain.content.errorcode.ContentErrorCode;
import com.king.backend.domain.content.repository.ContentRepository;
import com.king.backend.domain.user.dto.domain.OAuth2UserDTO;
import com.king.backend.global.exception.CustomException;
import com.king.backend.s3.service.S3Service;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ContentService {
    private final ContentRepository contentRepository;
    private final S3Service s3Service;

    @Transactional
    public ContentDetailResponseDto getContentDetail(Long id){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        OAuth2UserDTO user = (OAuth2UserDTO) authentication.getPrincipal();
        String language = user.getLanguage();
        log.info("user language : {}", language);

        Content content = contentRepository.findById(id).orElseThrow(() -> new CustomException(ContentErrorCode.CONTENT_NOT_FOUND));
        ContentTranslation contentTrans = content.getTranslation(language);

        String imageUrl = s3Service.getOrUploadImage(content);

        List<ContentDetailResponseDto.RelatedCast> relatedCasts = content.getContentCasts().stream()
                .map(cc -> mapToRelatedCasts(cc, language))
                .collect(Collectors.toList());

        return new ContentDetailResponseDto(
                content.getId(),
                contentTrans.getTitle(),
                content.getType(),
                content.getBroadcast(),
                contentTrans.getDescription(),
                imageUrl,
                content.getCreatedAt(),
                true,
                relatedCasts
        );
    }

    private ContentDetailResponseDto.RelatedCast mapToRelatedCasts(ContentCast contentCast, String language) {
        Cast cast = contentCast.getCast();
        CastTranslation castTrans = cast.getTranslation(language);

        String castImageUrl = s3Service.getOrUploadImage(cast);

        return new ContentDetailResponseDto.RelatedCast(
                cast.getId(),
                castTrans.getName(),
                castImageUrl,
                true
        );
    }
}
