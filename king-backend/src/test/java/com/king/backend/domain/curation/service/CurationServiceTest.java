package com.king.backend.domain.curation.service;

import com.king.backend.domain.curation.dto.request.CurationRequestDTO;
import com.king.backend.domain.curation.entity.CurationList;
import com.king.backend.domain.curation.entity.CurationListItem;
import com.king.backend.domain.curation.errorcode.CurationErrorCode;
import com.king.backend.domain.curation.repository.CurationListBookmarkRepository;
import com.king.backend.domain.curation.repository.CurationListItemRepository;
import com.king.backend.domain.curation.repository.CurationListRepository;
import com.king.backend.domain.place.entity.Place;
import com.king.backend.domain.place.errorcode.PlaceErrorCode;
import com.king.backend.domain.place.repository.PlaceRepository;
import com.king.backend.domain.place.service.GooglePhotoService;
import com.king.backend.domain.user.dto.domain.OAuth2UserDTO;
import com.king.backend.domain.user.entity.User;
import com.king.backend.domain.user.errorcode.UserErrorCode;
import com.king.backend.domain.user.repository.UserRepository;
import com.king.backend.global.exception.CustomException;
import com.king.backend.global.translate.TranslateService;
import com.king.backend.global.util.RedisUtil;
import com.king.backend.s3.service.S3Service;
import com.king.backend.search.util.CursorUtil;
import org.junit.jupiter.api.*;
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

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CurationServiceTest {

    @Mock private CursorUtil cursorUtil;
    @Mock private CurationListRepository curationListRepository;
    @Mock private CurationListBookmarkRepository curationListBookmarkRepository;
    @Mock private CurationListItemRepository curationListItemRepository;
    @Mock private UserRepository userRepository;
    @Mock private S3Service s3Service;
    @Mock private PlaceRepository placeRepository;
    @Mock private TranslateService translateService;
    @Mock private RedisUtil redisUtil;
    @Mock private GooglePhotoService googlePhotoService;

    @InjectMocks
    private CurationService curationService;

    @BeforeEach
    void setUp() {
        setSecurityContext(1L, "ko");
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    private void setSecurityContext(Long userId, String language) {
        OAuth2UserDTO authUser = new OAuth2UserDTO();
        authUser.setName(userId.toString());
        authUser.setLanguage(language);
        authUser.setAuthorities(List.of(new SimpleGrantedAuthority("ROLE_REGISTERED")));

        Authentication auth = new UsernamePasswordAuthenticationToken(
                authUser, null, authUser.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    private User createUser(Long id) {
        User user = new User();
        user.setId(id);
        user.setEmail("test@gmail.com");
        user.setNickname("testuser");
        user.setImageUrl("https://example.com/image.jpg");
        user.setStatus("ROLE_REGISTERED");
        return user;
    }

    private Place createPlace(Long id) {
        Place place = new Place();
        place.setId(id);
        place.setName("test place");
        place.setType("restaurant");
        place.setDescription("desc");
        place.setAddress("addr");
        place.setLat(37.5f);
        place.setLng(127.0f);
        return place;
    }

    private CurationRequestDTO createValidRequest() {
        CurationRequestDTO dto = new CurationRequestDTO();
        dto.setTitle("Valid Title");
        dto.setDescription("Valid description");
        dto.setPlaceIds(List.of(1L));
        return dto;
    }

    // ======================================================
    // postCuration
    // ======================================================

    // --- 분기 1: 정상 생성 ---

    @Test
    @DisplayName("postCuration — 정상 → CurationList + Item 저장")
    void postCuration_withValidInput_savesSuccessfully() {
        User user = createUser(1L);
        Place place = createPlace(1L);
        when(userRepository.findByIdAndStatus(1L, "ROLE_REGISTERED")).thenReturn(Optional.of(user));
        when(s3Service.uploadFile(any(), any())).thenReturn("https://s3/image.jpg");
        when(placeRepository.findById(1L)).thenReturn(Optional.of(place));
        when(curationListItemRepository.findByCurationListAndPlace(any(), any())).thenReturn(Optional.empty());
        when(curationListBookmarkRepository.existsByCurationListIdAndUserId(any(), any())).thenReturn(false);

        CurationListItem item = new CurationListItem();
        item.setPlace(place);
        when(curationListItemRepository.findByCurationListId(any())).thenReturn(List.of(item));

        CurationRequestDTO dto = createValidRequest();

        var result = curationService.postCuration(dto, null);

        assertThat(result).isNotNull();
        verify(curationListRepository).save(any());
        verify(curationListItemRepository).save(any());
    }

    // --- 분기 2: title null ---

    @Test
    @DisplayName("postCuration — title null → INVALID_VALUE")
    void postCuration_withNullTitle_throwsInvalidValue() {
        User user = createUser(1L);
        when(userRepository.findByIdAndStatus(1L, "ROLE_REGISTERED")).thenReturn(Optional.of(user));

        CurationRequestDTO dto = createValidRequest();
        dto.setTitle(null);

        assertThatThrownBy(() -> curationService.postCuration(dto, null))
                .isInstanceOf(CustomException.class)
                .satisfies(e -> assertThat(((CustomException) e).getErrorCode())
                        .isEqualTo(CurationErrorCode.INVALID_VALUE));
    }

    // --- 분기 3: 경계값 — title 50자 vs 51자 ---

    @Test
    @DisplayName("postCuration — title 50자 → 통과")
    void postCuration_withTitle50chars_passes() {
        User user = createUser(1L);
        Place place = createPlace(1L);
        when(userRepository.findByIdAndStatus(1L, "ROLE_REGISTERED")).thenReturn(Optional.of(user));
        when(s3Service.uploadFile(any(), any())).thenReturn("https://s3/image.jpg");
        when(placeRepository.findById(1L)).thenReturn(Optional.of(place));
        when(curationListItemRepository.findByCurationListAndPlace(any(), any())).thenReturn(Optional.empty());
        when(curationListBookmarkRepository.existsByCurationListIdAndUserId(any(), any())).thenReturn(false);

        CurationListItem item = new CurationListItem();
        item.setPlace(place);
        when(curationListItemRepository.findByCurationListId(any())).thenReturn(List.of(item));

        CurationRequestDTO dto = createValidRequest();
        dto.setTitle("a".repeat(50));

        var result = curationService.postCuration(dto, null);
        assertThat(result).isNotNull();
    }

    @Test
    @DisplayName("postCuration — title 51자 → INVALID_VALUE")
    void postCuration_withTitle51chars_throwsInvalidValue() {
        User user = createUser(1L);
        when(userRepository.findByIdAndStatus(1L, "ROLE_REGISTERED")).thenReturn(Optional.of(user));

        CurationRequestDTO dto = createValidRequest();
        dto.setTitle("a".repeat(51));

        assertThatThrownBy(() -> curationService.postCuration(dto, null))
                .isInstanceOf(CustomException.class)
                .satisfies(e -> assertThat(((CustomException) e).getErrorCode())
                        .isEqualTo(CurationErrorCode.INVALID_VALUE));
    }

    // --- 분기 4: 경계값 — description 1000자 vs 1001자 ---

    @Test
    @DisplayName("postCuration — description 1001자 → INVALID_VALUE")
    void postCuration_withDescription1001chars_throwsInvalidValue() {
        User user = createUser(1L);
        when(userRepository.findByIdAndStatus(1L, "ROLE_REGISTERED")).thenReturn(Optional.of(user));

        CurationRequestDTO dto = createValidRequest();
        dto.setDescription("a".repeat(1001));

        assertThatThrownBy(() -> curationService.postCuration(dto, null))
                .isInstanceOf(CustomException.class)
                .satisfies(e -> assertThat(((CustomException) e).getErrorCode())
                        .isEqualTo(CurationErrorCode.INVALID_VALUE));
    }

    // --- 분기 5: placeIds null → NPE (bugfix) ---

    @Test
    @Tag("bugfix")
    @DisplayName("[bugfix] postCuration — placeIds null → NPE 발생 (null 체크 없음)")
    void postCuration_withNullPlaceIds_throwsNpe() {
        User user = createUser(1L);
        when(userRepository.findByIdAndStatus(1L, "ROLE_REGISTERED")).thenReturn(Optional.of(user));

        CurationRequestDTO dto = new CurationRequestDTO();
        dto.setTitle("Valid Title");
        dto.setDescription("Valid description");
        dto.setPlaceIds(null);

        // pre-refactor: placeIds가 null이면 .isEmpty()에서 NPE
        // refactor 후: null 체크 추가 → INVALID_VALUE 예외
        assertThatThrownBy(() -> curationService.postCuration(dto, null))
                .isInstanceOf(CustomException.class)
                .satisfies(e -> assertThat(((CustomException) e).getErrorCode())
                        .isEqualTo(CurationErrorCode.INVALID_VALUE));
    }

    // --- 분기 6: 경계값 — placeIds 빈 리스트 ---

    @Test
    @DisplayName("postCuration — placeIds 빈 리스트 → INVALID_VALUE")
    void postCuration_withEmptyPlaceIds_throwsInvalidValue() {
        User user = createUser(1L);
        when(userRepository.findByIdAndStatus(1L, "ROLE_REGISTERED")).thenReturn(Optional.of(user));

        CurationRequestDTO dto = createValidRequest();
        dto.setPlaceIds(List.of());

        assertThatThrownBy(() -> curationService.postCuration(dto, null))
                .isInstanceOf(CustomException.class)
                .satisfies(e -> assertThat(((CustomException) e).getErrorCode())
                        .isEqualTo(CurationErrorCode.INVALID_VALUE));
    }

    // --- 분기 7: 중복 장소 ---

    @Test
    @DisplayName("postCuration — 중복 장소 → DUPLICATED_PLACE")
    void postCuration_withDuplicatePlace_throwsDuplicatedPlace() {
        User user = createUser(1L);
        Place place = createPlace(1L);
        when(userRepository.findByIdAndStatus(1L, "ROLE_REGISTERED")).thenReturn(Optional.of(user));
        when(s3Service.uploadFile(any(), any())).thenReturn("https://s3/image.jpg");
        when(placeRepository.findById(1L)).thenReturn(Optional.of(place));
        when(curationListItemRepository.findByCurationListAndPlace(any(), eq(place)))
                .thenReturn(Optional.of(new CurationListItem()));

        CurationRequestDTO dto = createValidRequest();
        dto.setPlaceIds(List.of(1L, 1L));

        assertThatThrownBy(() -> curationService.postCuration(dto, null))
                .isInstanceOf(CustomException.class)
                .satisfies(e -> assertThat(((CustomException) e).getErrorCode())
                        .isEqualTo(CurationErrorCode.DUPLICATED_PLACE));
    }

    // --- 분기 8: 존재하지 않는 장소 ---

    @Test
    @DisplayName("postCuration — 존재하지 않는 장소 → PLACE_NOT_FOUND")
    void postCuration_withNonExistentPlace_throwsPlaceNotFound() {
        User user = createUser(1L);
        when(userRepository.findByIdAndStatus(1L, "ROLE_REGISTERED")).thenReturn(Optional.of(user));
        when(s3Service.uploadFile(any(), any())).thenReturn("https://s3/image.jpg");
        when(placeRepository.findById(999L)).thenReturn(Optional.empty());

        CurationRequestDTO dto = createValidRequest();
        dto.setPlaceIds(List.of(999L));

        assertThatThrownBy(() -> curationService.postCuration(dto, null))
                .isInstanceOf(CustomException.class)
                .satisfies(e -> assertThat(((CustomException) e).getErrorCode())
                        .isEqualTo(PlaceErrorCode.PLACE_NOT_FOUND));
    }

    // ======================================================
    // putCuration
    // ======================================================

    // --- 분기 1: 정상 수정 ---

    @Test
    @DisplayName("putCuration — 정상 → 기존 항목 삭제 후 새 항목 저장")
    void putCuration_withValidInput_updatesSuccessfully() {
        User user = createUser(1L);
        Place place = createPlace(1L);
        CurationList curation = new CurationList();
        curation.setId(10L);
        curation.setWriter(user);
        curation.setTitle("old");
        curation.setDescription("old desc");

        when(userRepository.findByIdAndStatus(1L, "ROLE_REGISTERED")).thenReturn(Optional.of(user));
        when(curationListRepository.findById(10L)).thenReturn(Optional.of(curation));
        when(placeRepository.findById(1L)).thenReturn(Optional.of(place));
        when(curationListItemRepository.findByCurationListAndPlace(any(), any())).thenReturn(Optional.empty());
        when(curationListBookmarkRepository.existsByCurationListIdAndUserId(any(), any())).thenReturn(false);

        CurationListItem item = new CurationListItem();
        item.setPlace(place);
        when(curationListItemRepository.findByCurationListId(any())).thenReturn(List.of(item));

        CurationRequestDTO dto = createValidRequest();

        var result = curationService.putCuration(10L, dto, null);

        assertThat(result).isNotNull();
        verify(curationListItemRepository).deleteAllByCurationList(curation);
        verify(curationListRepository).save(curation);
        verify(redisUtil, times(2)).deleteValue(any());
    }

    // --- 분기 2: 본인 아님 ---

    @Test
    @DisplayName("putCuration — 본인 큐레이션 아님 → FORBIDDEN_CURATION")
    void putCuration_withOtherWriter_throwsForbiddenCuration() {
        User user = createUser(1L);
        User otherUser = createUser(2L);
        CurationList curation = new CurationList();
        curation.setId(10L);
        curation.setWriter(otherUser);

        when(userRepository.findByIdAndStatus(1L, "ROLE_REGISTERED")).thenReturn(Optional.of(user));
        when(curationListRepository.findById(10L)).thenReturn(Optional.of(curation));

        CurationRequestDTO dto = createValidRequest();

        assertThatThrownBy(() -> curationService.putCuration(10L, dto, null))
                .isInstanceOf(CustomException.class)
                .satisfies(e -> assertThat(((CustomException) e).getErrorCode())
                        .isEqualTo(CurationErrorCode.FORBIDDEN_CURATION));
    }

    // --- 분기 3: 큐레이션 없음 ---

    @Test
    @DisplayName("putCuration — 큐레이션 없음 → CURATION_NOT_FOUND")
    void putCuration_withNonExistentCuration_throwsCurationNotFound() {
        User user = createUser(1L);
        when(userRepository.findByIdAndStatus(1L, "ROLE_REGISTERED")).thenReturn(Optional.of(user));
        when(curationListRepository.findById(999L)).thenReturn(Optional.empty());

        CurationRequestDTO dto = createValidRequest();

        assertThatThrownBy(() -> curationService.putCuration(999L, dto, null))
                .isInstanceOf(CustomException.class)
                .satisfies(e -> assertThat(((CustomException) e).getErrorCode())
                        .isEqualTo(CurationErrorCode.CURATION_NOT_FOUND));
    }

    // ======================================================
    // deleteCuration
    // ======================================================

    // --- 분기 1: 정상 삭제 ---

    @Test
    @DisplayName("deleteCuration — 정상 → bookmark + item + curation 삭제")
    void deleteCuration_withValidInput_deletesAll() {
        User user = createUser(1L);
        CurationList curation = new CurationList();
        curation.setId(10L);
        curation.setWriter(user);

        when(userRepository.findByIdAndStatus(1L, "ROLE_REGISTERED")).thenReturn(Optional.of(user));
        when(curationListRepository.findById(10L)).thenReturn(Optional.of(curation));

        curationService.deleteCuration(10L);

        verify(curationListBookmarkRepository).deleteAllByCurationList(curation);
        verify(curationListItemRepository).deleteAllByCurationList(curation);
        verify(curationListRepository).delete(curation);
    }

    // --- 분기 2: 본인 아님 ---

    @Test
    @DisplayName("deleteCuration — 본인 아님 → FORBIDDEN_CURATION")
    void deleteCuration_withOtherWriter_throwsForbiddenCuration() {
        User user = createUser(1L);
        User otherUser = createUser(2L);
        CurationList curation = new CurationList();
        curation.setId(10L);
        curation.setWriter(otherUser);

        when(userRepository.findByIdAndStatus(1L, "ROLE_REGISTERED")).thenReturn(Optional.of(user));
        when(curationListRepository.findById(10L)).thenReturn(Optional.of(curation));

        assertThatThrownBy(() -> curationService.deleteCuration(10L))
                .isInstanceOf(CustomException.class)
                .satisfies(e -> assertThat(((CustomException) e).getErrorCode())
                        .isEqualTo(CurationErrorCode.FORBIDDEN_CURATION));
    }

    // --- 분기 3: 큐레이션 없음 ---

    @Test
    @DisplayName("deleteCuration — 큐레이션 없음 → CURATION_NOT_FOUND")
    void deleteCuration_withNonExistentCuration_throwsCurationNotFound() {
        User user = createUser(1L);
        when(userRepository.findByIdAndStatus(1L, "ROLE_REGISTERED")).thenReturn(Optional.of(user));
        when(curationListRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> curationService.deleteCuration(999L))
                .isInstanceOf(CustomException.class)
                .satisfies(e -> assertThat(((CustomException) e).getErrorCode())
                        .isEqualTo(CurationErrorCode.CURATION_NOT_FOUND));
    }
}
