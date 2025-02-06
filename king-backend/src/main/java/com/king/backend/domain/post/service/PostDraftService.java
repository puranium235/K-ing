package com.king.backend.domain.post.service;

import com.king.backend.connection.RedisUtil;
import com.king.backend.domain.post.dto.request.PostDraftRequestDto;
import com.king.backend.domain.post.dto.response.PostDraftResponseDto;
import com.king.backend.domain.user.dto.domain.OAuth2UserDTO;
import com.king.backend.s3.service.S3Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
@Slf4j
public class PostDraftService {
    private final RedisUtil redisUtil;
    private final S3Service s3Service;

    public void saveDraft(PostDraftRequestDto reqDto, MultipartFile imageFile) {
        if(imageFile != null && !imageFile.isEmpty()) {
            String imageUrl = s3Service.uploadFile(null, imageFile);
            reqDto.setImageUrl(imageUrl);
        }
        log.info("saveDraft reqDto : {}", reqDto);
        redisUtil.setJsonValue(getDraftKey(), reqDto);
        String storedData = redisUtil.getValue(getDraftKey());
        log.info("Redis에 저장된 데이터 reqDto :{}", storedData);
    }

    public PostDraftResponseDto getDraft() {
        log.info("getDraft로 가져온 값 : {}", redisUtil.getJsonValue(getDraftKey(), PostDraftResponseDto.class));
        PostDraftRequestDto draft = redisUtil.getJsonValue(getDraftKey(), PostDraftRequestDto.class);
        if (draft == null) {
            return null;
        }
        PostDraftResponseDto.Place place = null;
        if (draft.getPlace() != null) {
            place = PostDraftResponseDto.Place.builder()
                    .placeId(draft.getPlace().getPlaceId())
                    .name(draft.getPlace().getName())
                    .build();
        }

        return PostDraftResponseDto.builder()
                .content(draft.getContent())
                .place(place)
                .imageUrl(draft.getImageUrl())
                .build();
    }

    public void deleteDraft() {
        PostDraftRequestDto existingDraft = redisUtil.getJsonValue(getDraftKey(), PostDraftRequestDto.class);
        if(existingDraft != null && existingDraft.getImageUrl() != null) {
            s3Service.deleteFile(existingDraft.getImageUrl());
        }
        redisUtil.deleteValue(getDraftKey());
    }

    private String getDraftKey() {
        Long userId = getCurrentUserId();
        return "post:draft:" + userId;
    }

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        OAuth2UserDTO user = (OAuth2UserDTO) authentication.getPrincipal();
        return Long.parseLong(user.getName());
    }
}