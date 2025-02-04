package com.king.backend.domain.curation.service;

import com.king.backend.domain.curation.dto.response.CurationDetailResponseDTO;
import com.king.backend.domain.curation.entity.CurationList;
import com.king.backend.domain.curation.errorcode.CurationErrorCode;
import com.king.backend.domain.curation.repository.CurationListBookmarkRepository;
import com.king.backend.domain.curation.repository.CurationListItemRepository;
import com.king.backend.domain.curation.repository.CurationListRepository;
import com.king.backend.domain.user.dto.domain.OAuth2UserDTO;
import com.king.backend.global.exception.CustomException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CurationService {
    private final CurationListRepository curationListRepository;
    private final CurationListBookmarkRepository curationListBookmarkRepository;
    private final CurationListItemRepository curationListItemRepository;

    @Transactional
    public CurationDetailResponseDTO getCurationDetail(Long curationListId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        OAuth2UserDTO user = (OAuth2UserDTO) authentication.getPrincipal();

        Long userId = Long.parseLong(user.getName());

        CurationList curationList = curationListRepository.findById(curationListId)
                .orElseThrow(() -> new CustomException(CurationErrorCode.CURATION_NOT_FOUND));

        boolean bookmarked = curationListBookmarkRepository.existsByCurationListIdAndUserId(curationListId, userId);

        List<CurationDetailResponseDTO.PlaceDTO> places = curationListItemRepository.findByCurationListId(curationListId)
                .stream()
                .map((item) -> CurationDetailResponseDTO.PlaceDTO.fromEntity(item.getPlace()))
                .toList();

        return CurationDetailResponseDTO.fromEntity(curationList, bookmarked, places);
    }
}
