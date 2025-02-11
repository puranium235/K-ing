package com.king.backend.domain.curation.service;

import com.king.backend.domain.curation.dto.request.CurationPostRequestDTO;
import com.king.backend.domain.post.errorcode.PostErrorCode;
import com.king.backend.domain.user.dto.domain.OAuth2UserDTO;
import com.king.backend.global.errorcode.RedisErrorCode;
import com.king.backend.global.exception.CustomException;
import com.king.backend.global.util.RedisUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
@RequiredArgsConstructor
public class CurationDraftService {

    private final RedisUtil redisUtil;

    public void saveDraft(CurationPostRequestDTO reqDto, MultipartFile imageFile) {
        String draftKey = getDraftKey();
        String imageKey = draftKey + ":image";

        redisUtil.setJsonValue(draftKey, reqDto);

        if(imageFile != null && !imageFile.isEmpty()) {
            long maxFileSize = 5 * 1024 * 1024;
            if(imageFile.getSize() > maxFileSize) {
                throw new CustomException(PostErrorCode.MAX_UPLOAD_SIZE_EXCEEDED);
            }
            try {
                byte[] imageBytes = imageFile.getBytes();
                redisUtil.setBinaryValue(imageKey, imageBytes);
            } catch (IOException e) {
                throw new CustomException(RedisErrorCode.REDIS_SAVE_FAILED);
            }
        }
    }

    private String getDraftKey() {
        Long userId = getCurrentUserId();
        return "curation:draft:user" + userId;
    }

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        OAuth2UserDTO user = (OAuth2UserDTO) authentication.getPrincipal();
        return Long.parseLong(user.getName());
    }
}
