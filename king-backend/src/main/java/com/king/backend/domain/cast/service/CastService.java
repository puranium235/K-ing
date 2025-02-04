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
            for (ContentCast contentCast : cast.getContentCasts()) {
                Long contentId = contentCast.getContent().getId();
                String title = contentCast.getContent().getTranslationKo().getTitle();
                String contentImageUrl = s3Service.getOrUploadImage(contentCast.getContent());
                int year = contentCast.getContent().getCreatedAt().getYear();

                relatedContents.add(new CastDetailResponseDto.RelatedContent(
                        contentId,
                        title,
                        contentImageUrl,
                        true
                ));

                works.add(new CastDetailResponseDto.Work(contentId, year, title));
            }
        }

        // works 연도 기준으로 정렬 (내림차순)
        works.sort((work1, work2)->Integer.compare(work2.getYear(), work1.getYear()));

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
