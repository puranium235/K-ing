package com.king.backend.domain.curation.service;

import com.king.backend.domain.curation.dto.request.BookmarkRequestDTO;
import com.king.backend.domain.curation.entity.CurationList;
import com.king.backend.domain.curation.entity.CurationListBookmark;
import com.king.backend.domain.curation.errorcode.CurationErrorCode;
import com.king.backend.domain.curation.repository.CurationListBookmarkRepository;
import com.king.backend.domain.curation.repository.CurationListRepository;
import com.king.backend.domain.user.dto.domain.OAuth2UserDTO;
import com.king.backend.domain.user.entity.User;
import com.king.backend.domain.user.repository.UserRepository;
import com.king.backend.global.exception.CustomException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookmarkServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private CurationListRepository curationListRepository;

    @Mock
    private CurationListBookmarkRepository curationListBookmarkRepository;

    @InjectMocks
    private BookmarkService bookmarkService;

    private User user;
    private User otherUser;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);
        user.setStatus("ROLE_REGISTERED");

        otherUser = new User();
        otherUser.setId(2L);
        otherUser.setStatus("ROLE_REGISTERED");

        OAuth2UserDTO authUser = new OAuth2UserDTO();
        authUser.setName("1");
        authUser.setLanguage("ko");
        authUser.setAuthorities(List.of(new SimpleGrantedAuthority("ROLE_REGISTERED")));

        Authentication auth = new UsernamePasswordAuthenticationToken(
                authUser, null, authUser.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    private BookmarkRequestDTO createRequest(Long curationId) {
        BookmarkRequestDTO dto = new BookmarkRequestDTO();
        dto.setCurationId(curationId);
        return dto;
    }

    private CurationList createCuration(User writer, boolean isPublic) {
        CurationList curation = new CurationList();
        curation.setId(100L);
        curation.setWriter(writer);
        curation.setPublic(isPublic);
        return curation;
    }

    // =====================================================
    // postBookmark
    // =====================================================

    // --- 분기 1: 정상 — public 큐레이션 → 북마크 저장 ---

    @Test
    @DisplayName("공개 큐레이션 북마크 → 저장 성공")
    void postBookmark_withPublicCuration_saves() {
        CurationList curation = createCuration(otherUser, true);

        when(userRepository.findByIdAndStatus(1L, "ROLE_REGISTERED")).thenReturn(Optional.of(user));
        when(curationListRepository.findById(100L)).thenReturn(Optional.of(curation));
        when(curationListBookmarkRepository.existsByCurationListIdAndUserId(100L, 1L)).thenReturn(false);

        bookmarkService.postBookmark(createRequest(100L));

        verify(curationListBookmarkRepository).save(any(CurationListBookmark.class));
    }

    // --- 분기 2: 비공개 + 본인 → 북마크 저장 ---

    @Test
    @DisplayName("비공개 큐레이션 + 본인 → 저장 성공")
    void postBookmark_withPrivateCurationOwnedByUser_saves() {
        CurationList curation = createCuration(user, false);

        when(userRepository.findByIdAndStatus(1L, "ROLE_REGISTERED")).thenReturn(Optional.of(user));
        when(curationListRepository.findById(100L)).thenReturn(Optional.of(curation));
        when(curationListBookmarkRepository.existsByCurationListIdAndUserId(100L, 1L)).thenReturn(false);

        bookmarkService.postBookmark(createRequest(100L));

        verify(curationListBookmarkRepository).save(any(CurationListBookmark.class));
    }

    // --- 분기 3: 비공개 + 타인 → CURATION_NOT_FOUND ---

    @Test
    @DisplayName("비공개 큐레이션 + 타인 → CURATION_NOT_FOUND")
    void postBookmark_withPrivateCurationOwnedByOther_throwsCurationNotFound() {
        CurationList curation = createCuration(otherUser, false);

        when(userRepository.findByIdAndStatus(1L, "ROLE_REGISTERED")).thenReturn(Optional.of(user));
        when(curationListRepository.findById(100L)).thenReturn(Optional.of(curation));

        assertThatThrownBy(() -> bookmarkService.postBookmark(createRequest(100L)))
                .isInstanceOf(CustomException.class)
                .satisfies(ex -> {
                    CustomException ce = (CustomException) ex;
                    assert ce.getErrorCode() == CurationErrorCode.CURATION_NOT_FOUND;
                });

        verify(curationListBookmarkRepository, never()).save(any());
    }

    // --- 분기 4: 이미 북마크됨 → DUPLICATED_BOOKMARK ---

    @Test
    @DisplayName("이미 북마크된 큐레이션 → DUPLICATED_BOOKMARK")
    void postBookmark_withAlreadyBookmarked_throwsDuplicatedBookmark() {
        CurationList curation = createCuration(otherUser, true);

        when(userRepository.findByIdAndStatus(1L, "ROLE_REGISTERED")).thenReturn(Optional.of(user));
        when(curationListRepository.findById(100L)).thenReturn(Optional.of(curation));
        when(curationListBookmarkRepository.existsByCurationListIdAndUserId(100L, 1L)).thenReturn(true);

        assertThatThrownBy(() -> bookmarkService.postBookmark(createRequest(100L)))
                .isInstanceOf(CustomException.class)
                .satisfies(ex -> {
                    CustomException ce = (CustomException) ex;
                    assert ce.getErrorCode() == CurationErrorCode.DUPLICATED_BOOKMARK;
                });
    }

    // --- 분기 5: 큐레이션 없음 → CURATION_NOT_FOUND ---

    @Test
    @DisplayName("존재하지 않는 큐레이션 → CURATION_NOT_FOUND")
    void postBookmark_withNonExistentCuration_throwsCurationNotFound() {
        when(userRepository.findByIdAndStatus(1L, "ROLE_REGISTERED")).thenReturn(Optional.of(user));
        when(curationListRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> bookmarkService.postBookmark(createRequest(999L)))
                .isInstanceOf(CustomException.class)
                .satisfies(ex -> {
                    CustomException ce = (CustomException) ex;
                    assert ce.getErrorCode() == CurationErrorCode.CURATION_NOT_FOUND;
                });
    }

    // =====================================================
    // deleteBookmark
    // =====================================================

    // --- 분기 1: 정상 → 북마크 삭제 ---

    @Test
    @DisplayName("정상 북마크 삭제 → 삭제 성공")
    void deleteBookmark_withValidBookmark_deletes() {
        CurationList curation = createCuration(otherUser, true);
        CurationListBookmark bookmark = new CurationListBookmark();

        when(userRepository.findByIdAndStatus(1L, "ROLE_REGISTERED")).thenReturn(Optional.of(user));
        when(curationListRepository.findById(100L)).thenReturn(Optional.of(curation));
        when(curationListBookmarkRepository.findByCurationListAndUser(curation, user))
                .thenReturn(Optional.of(bookmark));

        bookmarkService.deleteBookmark(createRequest(100L));

        verify(curationListBookmarkRepository).delete(bookmark);
    }

    // --- 분기 2: 비공개 + 타인 → CURATION_NOT_FOUND ---

    @Test
    @DisplayName("비공개 큐레이션 + 타인 → CURATION_NOT_FOUND")
    void deleteBookmark_withPrivateCurationOwnedByOther_throwsCurationNotFound() {
        CurationList curation = createCuration(otherUser, false);

        when(userRepository.findByIdAndStatus(1L, "ROLE_REGISTERED")).thenReturn(Optional.of(user));
        when(curationListRepository.findById(100L)).thenReturn(Optional.of(curation));

        assertThatThrownBy(() -> bookmarkService.deleteBookmark(createRequest(100L)))
                .isInstanceOf(CustomException.class)
                .satisfies(ex -> {
                    CustomException ce = (CustomException) ex;
                    assert ce.getErrorCode() == CurationErrorCode.CURATION_NOT_FOUND;
                });

        verify(curationListBookmarkRepository, never()).delete(any());
    }

    // --- 분기 3: 북마크 없음 → NOT_BOOKMARKED ---

    @Test
    @DisplayName("북마크되지 않은 큐레이션 삭제 → NOT_BOOKMARKED")
    void deleteBookmark_withNoBookmark_throwsNotBookmarked() {
        CurationList curation = createCuration(otherUser, true);

        when(userRepository.findByIdAndStatus(1L, "ROLE_REGISTERED")).thenReturn(Optional.of(user));
        when(curationListRepository.findById(100L)).thenReturn(Optional.of(curation));
        when(curationListBookmarkRepository.findByCurationListAndUser(curation, user))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> bookmarkService.deleteBookmark(createRequest(100L)))
                .isInstanceOf(CustomException.class)
                .satisfies(ex -> {
                    CustomException ce = (CustomException) ex;
                    assert ce.getErrorCode() == CurationErrorCode.NOT_BOOKMARKED;
                });
    }
}
