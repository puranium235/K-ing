package com.king.backend.domain.curation.service;

import com.king.backend.domain.curation.dto.request.CurationListRequestDTO;
import com.king.backend.domain.curation.dto.response.CurationDetailResponseDTO;
import com.king.backend.domain.curation.dto.response.CurationListResponseDTO;
import com.king.backend.domain.curation.entity.CurationList;
import com.king.backend.domain.curation.errorcode.CurationErrorCode;
import com.king.backend.domain.curation.repository.CurationListBookmarkRepository;
import com.king.backend.domain.curation.repository.CurationListItemRepository;
import com.king.backend.domain.curation.repository.CurationListRepository;
import com.king.backend.domain.user.dto.domain.OAuth2UserDTO;
import com.king.backend.domain.user.entity.User;
import com.king.backend.domain.user.errorcode.UserErrorCode;
import com.king.backend.domain.user.repository.UserRepository;
import com.king.backend.global.exception.CustomException;
import com.king.backend.search.util.CursorUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CurationService {
    private final CursorUtil cursorUtil;
    private final CurationListRepository curationListRepository;
    private final CurationListBookmarkRepository curationListBookmarkRepository;
    private final CurationListItemRepository curationListItemRepository;
    private final UserRepository userRepository;

    @Transactional
    public CurationDetailResponseDTO getCurationDetail(Long curationListId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        OAuth2UserDTO user = (OAuth2UserDTO) authentication.getPrincipal();

        Long userId = Long.parseLong(user.getName());

        CurationList curationList = curationListRepository.findById(curationListId)
                .orElseThrow(() -> new CustomException(CurationErrorCode.CURATION_NOT_FOUND));

        if (!curationList.isPublic() && !curationList.getWriter().getId().equals(userId)) {
            throw new CustomException(CurationErrorCode.CURATION_NOT_FOUND);
        }

        boolean bookmarked = curationListBookmarkRepository.existsByCurationListIdAndUserId(curationListId, userId);

        List<CurationDetailResponseDTO.PlaceDTO> places = curationListItemRepository.findByCurationListId(curationListId)
                .stream()
                .map((item) -> CurationDetailResponseDTO.PlaceDTO.fromEntity(item.getPlace()))
                .toList();

        return CurationDetailResponseDTO.fromEntity(curationList, bookmarked, places);
    }

    @Transactional
    public CurationListResponseDTO getCurations(CurationListRequestDTO requestDTO) {
        Long userId = requestDTO.getUserId();
        String cursor = requestDTO.getCursor();
        int size = Optional.ofNullable(requestDTO.getSize()).orElse(10);
        List<Object> sortValues = (cursor != null) ? cursorUtil.decodeCursor(cursor) : null;

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        OAuth2UserDTO authUser = (OAuth2UserDTO) authentication.getPrincipal();

        Long authId = Long.parseLong(authUser.getName());

        List<CurationList> curations;

        if (userId == null) {
            curations = getPublicCurationList(sortValues, size);
        } else {
            User user = userRepository.findByIdAndStatus(userId, "ROLE_REGISTERED")
                    .orElseThrow(() -> new CustomException(UserErrorCode.USER_NOT_FOUND));

            curations = (userId.equals(authId))
                    ? getSelfCurationList(user, sortValues, size)
                    : getPublicCurationList(user, sortValues, size);
        }

        String nextCursor = (curations.size() == size)
                ? cursorUtil.encodeCursor(List.of(curations.get(curations.size() - 1).getId()))
                : null;

        return CurationListResponseDTO.fromEntity(curations, nextCursor);
    }

    private List<CurationList> getPublicCurationList(List<Object> sortValues, int size) {
        if (sortValues == null) {
            return curationListRepository.findAllByIsPublicOrderByIdDesc(true, PageRequest.of(0, size));
        } else {
            Long id = Long.parseLong(sortValues.get(0).toString());
            return curationListRepository.findByIsPublicAndIdLessThanOrderByIdDesc(true, id, PageRequest.of(0, size));
        }
    }

    private List<CurationList> getPublicCurationList(User user, List<Object> sortValues, int size) {
        if (sortValues == null || sortValues.isEmpty()) {
            return curationListRepository.findAllByIsPublicAndWriterOrderByIdDesc(true, user, PageRequest.of(0, size));
        } else {
            Long id = Long.parseLong(sortValues.get(0).toString());
            return curationListRepository.findByIsPublicAndWriterAndIdLessThanOrderByIdDesc(true, user, id, PageRequest.of(0, size));
        }
    }

    private List<CurationList> getSelfCurationList(User user, List<Object> sortValues, int size) {
        if (sortValues == null) {
            return curationListRepository.findAllByWriterOrderByIdDesc(user, PageRequest.of(0, size));
        } else {
            Long id = Long.parseLong(sortValues.get(0).toString());
            return curationListRepository.findByWriterAndIdLessThanOrderByIdDesc(user, id, PageRequest.of(0, size));
        }
    }
}
