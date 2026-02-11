package com.king.backend.domain.curation.service;

import com.king.backend.domain.curation.dto.request.CurationRequestDTO;
import com.king.backend.domain.curation.dto.response.CurationDraftResponseDTO;
import com.king.backend.domain.curation.errorcode.CurationErrorCode;
import com.king.backend.domain.place.entity.Place;
import com.king.backend.domain.place.errorcode.PlaceErrorCode;
import com.king.backend.domain.place.repository.PlaceRepository;

import com.king.backend.global.errorcode.ImageErrorCode;
import com.king.backend.global.errorcode.RedisErrorCode;
import com.king.backend.global.exception.CustomException;
import com.king.backend.global.util.RedisUtil;
import com.king.backend.global.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class CurationDraftService {

    private final RedisUtil redisUtil;
    private final PlaceRepository placeRepository;

    public void saveDraft(CurationRequestDTO reqDto, MultipartFile imageFile) {
        if (reqDto.getTitle() != null && reqDto.getTitle().length() > 50) {
            throw new CustomException(CurationErrorCode.INVALID_VALUE);
        }

        if (reqDto.getDescription() != null && reqDto.getDescription().length() > 1000) {
            throw new CustomException(CurationErrorCode.INVALID_VALUE);
        }

        if (reqDto.getPlaceIds() != null && !reqDto.getPlaceIds().isEmpty()) {
            reqDto.getPlaceIds()
                    .forEach((placeId) -> {
                        placeRepository.findById(placeId)
                                .orElseThrow(() -> new CustomException(PlaceErrorCode.PLACE_NOT_FOUND));
                    });
        }

        String draftKey = getDraftKey();
        String imageKey = draftKey + ":image";

        redisUtil.setJsonValue(draftKey, reqDto, 7, TimeUnit.DAYS);

        if(imageFile != null && !imageFile.isEmpty()) {
            long maxFileSize = 5 * 1024 * 1024;
            if(imageFile.getSize() > maxFileSize) {
                throw new CustomException(ImageErrorCode.MAX_UPLOAD_SIZE_EXCEEDED);
            }
            try {
                byte[] imageBytes = imageFile.getBytes();
                redisUtil.setBinaryValue(imageKey, imageBytes, 7, TimeUnit.DAYS);
            } catch (IOException e) {
                throw new CustomException(RedisErrorCode.REDIS_SAVE_FAILED);
            }
        } else {
            redisUtil.deleteBinaryValue(imageKey);
        }
    }

    public CurationDraftResponseDTO getDraft() {
        String draftKey = getDraftKey();
        String imageKey = draftKey + ":image";

        CurationRequestDTO draft = redisUtil.getJsonValue(draftKey, CurationRequestDTO.class);
        byte[] imageData = redisUtil.getBinaryValue(imageKey);

        if (draft == null && imageData == null) {
            return null;
        }

        CurationDraftResponseDTO responseDTO = new CurationDraftResponseDTO();

        if (draft != null) {
            responseDTO.setTitle(draft.getTitle());
            responseDTO.setDescription(draft.getDescription());
            responseDTO.setPublic(draft.isPublic());

            List<CurationDraftResponseDTO.PlaceDTO> places = new ArrayList<>();
            if (draft.getPlaceIds() != null) {
                for (Long placeId : draft.getPlaceIds()) {
                    Place place = placeRepository.findById(placeId)
                            .orElseThrow(() -> new CustomException(PlaceErrorCode.PLACE_NOT_FOUND));
                    places.add(CurationDraftResponseDTO.PlaceDTO.fromEntity(place));
                }
            }
            responseDTO.setPlaces(places);
        }

        responseDTO.setImageData(imageData);

        return responseDTO;
    }

    public void deleteDraft() {
        String draftKey = getDraftKey();
        String imageKey = draftKey + ":image";

        redisUtil.deleteValue(draftKey);
        redisUtil.deleteBinaryValue(imageKey);
    }

    private String getDraftKey() {
        Long userId = SecurityUtil.getCurrentUserId();
        return "curation:draft:user" + userId;
    }
}
