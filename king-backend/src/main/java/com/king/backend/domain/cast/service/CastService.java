package com.king.backend.domain.cast.service;

import com.king.backend.domain.cast.dto.response.CastDetailResponseDto;
import com.king.backend.domain.cast.entity.Cast;
import com.king.backend.domain.cast.errorcode.CastErrorCode;
import com.king.backend.domain.cast.repository.CastRepository;
import com.king.backend.domain.content.entity.ContentCast;
import com.king.backend.s3.service.S3Service;
import com.king.backend.global.exception.CustomException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CastService {
    private final CastRepository castRepository;
    private final S3Service s3Service;

    @Transactional
    public CastDetailResponseDto getCastDetail(Long id){
        Cast cast = castRepository.findById(id).orElseThrow(() -> new CustomException(CastErrorCode.CAST_NOT_FOUND));
        List<CastDetailResponseDto.RelatedContent> relatedContents = new ArrayList<>();
        List<CastDetailResponseDto.Work> works = new ArrayList<>();

        String imageUrl = s3Service.getOrUploadImage(cast);

        if (cast != null) {
            List<ContentCast> sortedContentCasts = cast.getContentCasts().stream()
                    .sorted((c1, c2) -> {
                        if (c1.getContent().getCreatedAt() == null) return 1;
                        if (c2.getContent().getCreatedAt() == null) return -1;
                        return c2.getContent().getCreatedAt().compareTo(c1.getContent().getCreatedAt());
                    })
                    .toList();

            for (ContentCast contentCast : sortedContentCasts) {
                Long contentId = contentCast.getContent().getId();
                String title = contentCast.getContent().getTranslationKo().getTitle();
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

        return new CastDetailResponseDto(
                cast.getId(),
                cast.getTranslationKo().getName(),
                imageUrl,
                cast.getBirthDate(),
                cast.getTranslationKo().getBirthPlace(),
                cast.getParticipatingWork(),
                cast.getCreatedAt(),
                true,
                relatedContents,
                works
        );
    }
}
