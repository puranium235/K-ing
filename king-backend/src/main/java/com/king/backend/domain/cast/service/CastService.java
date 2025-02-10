package com.king.backend.domain.cast.service;

import com.king.backend.domain.cast.dto.response.CastDetailResponseDto;
import com.king.backend.domain.cast.entity.Cast;
import com.king.backend.domain.cast.entity.CastTranslation;
import com.king.backend.domain.cast.errorcode.CastErrorCode;
import com.king.backend.domain.cast.repository.CastRepository;
import com.king.backend.domain.content.entity.ContentCast;
import com.king.backend.domain.user.dto.domain.OAuth2UserDTO;
import com.king.backend.global.exception.CustomException;
import com.king.backend.s3.service.S3Service;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class CastService {
    private final CastRepository castRepository;
    private final S3Service s3Service;

    @Transactional
    public CastDetailResponseDto getCastDetail(Long id){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        OAuth2UserDTO user = (OAuth2UserDTO) authentication.getPrincipal();
        String language = user.getLanguage();
        log.info("user language : {}", language);

        Cast cast = castRepository.findById(id).orElseThrow(() -> new CustomException(CastErrorCode.CAST_NOT_FOUND));
        List<CastDetailResponseDto.RelatedContent> relatedContents = new ArrayList<>();
        List<CastDetailResponseDto.Work> works = new ArrayList<>();

        String imageUrl = s3Service.getOrUploadImage(cast);

        if (cast != null) {
            List<ContentCast> sortedContentCasts = cast.getContentCasts().stream()
                    .sorted((c1, c2) -> {
                        if (c1.getContent().getCreatedAt() == null && c2.getContent().getCreatedAt() == null) {
                            return 0;
                        }
                        if (c1.getContent().getCreatedAt() == null) return 1;
                        if (c2.getContent().getCreatedAt() == null) return -1;
                        return c2.getContent().getCreatedAt().compareTo(c1.getContent().getCreatedAt());
                    })
                    .toList();

            for (ContentCast contentCast : sortedContentCasts) {
                Long contentId = contentCast.getContent().getId();
                String title = contentCast.getContent().getTranslation(language).getTitle();
                String contentImageUrl = s3Service.getOrUploadImage(contentCast.getContent());
                String year = (contentCast.getContent().getCreatedAt() == null) ? "" : String.valueOf(contentCast.getContent().getCreatedAt().getYear());
                relatedContents.add(new CastDetailResponseDto.RelatedContent(
                        contentId,
                        title,
                        contentImageUrl,
                        true
                ));

                works.add(new CastDetailResponseDto.Work(contentId, year, title));
            }
        }

        CastTranslation castTrans = cast.getTranslation(language);

        return new CastDetailResponseDto(
                cast.getId(),
                castTrans.getName(),
                imageUrl,
                cast.getBirthDate(),
                castTrans.getBirthPlace(),
                cast.getParticipatingWork(),
                cast.getCreatedAt(),
                true,
                relatedContents,
                works
        );
    }
}
