package com.king.backend.domain.user.service;

import com.king.backend.domain.user.dto.domain.OAuth2UserDTO;
import com.king.backend.domain.user.dto.request.PatchUserRequestDTO;
import com.king.backend.domain.user.dto.response.UserProfileResponseDTO;
import com.king.backend.domain.user.entity.User;
import com.king.backend.domain.user.errorcode.UserErrorCode;
import com.king.backend.domain.user.jwt.JWTUtil;
import com.king.backend.domain.user.repository.TokenRepository;
import com.king.backend.domain.user.repository.UserRepository;
import com.king.backend.global.exception.CustomException;
import com.king.backend.global.response.ApiResponse;
import com.king.backend.s3.service.S3Service;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.lang.reflect.Field;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private TokenRepository tokenRepository;

    @Mock
    private S3Service s3Service;

    @Mock
    private JWTUtil jwtUtil;

    @InjectMocks
    private UserService userService;

    @BeforeEach
    void setUp() throws Exception {
        setSecurityContext(1L, "ko");

        // @Value 필드를 리플렉션으로 설정
        Field accessField = UserService.class.getDeclaredField("ACCESSTOKEN_EXPIRES_IN");
        accessField.setAccessible(true);
        accessField.set(userService, 3600000L);

        Field refreshField = UserService.class.getDeclaredField("REFRESHTOKEN_EXPIRES_IN");
        refreshField.setAccessible(true);
        refreshField.set(userService, 604800000L);
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

    private User createUser(Long id, String nickname, String language) {
        User user = new User();
        user.setId(id);
        user.setEmail("test@gmail.com");
        user.setNickname(nickname);
        user.setImageUrl("https://example.com/image.jpg");
        user.setLanguage(language);
        user.setStatus("ROLE_REGISTERED");
        user.setDescription("hello");
        user.setContentAlarmOn(true);
        return user;
    }

    // ======================================================
    // getUserById
    // ======================================================

    // --- 분기 1: 본인 조회 → fromSelfEntity ---

    @Test
    @DisplayName("getUserById — 본인 조회 → contentAlarmOn, language 포함")
    void getUserById_withSelf_returnsSelfProfile() {
        User user = createUser(1L, "testuser", "ko");
        when(userRepository.findByIdAndStatus(1L, "ROLE_REGISTERED"))
                .thenReturn(Optional.of(user));

        UserProfileResponseDTO result = userService.getUserById("1");

        assertThat(result.getContentAlarmOn()).isNotNull();
        assertThat(result.getLanguage()).isNotNull();
    }

    // --- 분기 2: 타인 조회 → fromEntity ---

    @Test
    @DisplayName("getUserById — 타인 조회 → contentAlarmOn, language null")
    void getUserById_withOther_returnsPublicProfile() {
        User user = createUser(2L, "otheruser", "en");
        when(userRepository.findByIdAndStatus(2L, "ROLE_REGISTERED"))
                .thenReturn(Optional.of(user));

        UserProfileResponseDTO result = userService.getUserById("2");

        assertThat(result.getContentAlarmOn()).isNull();
        assertThat(result.getLanguage()).isNull();
    }

    // --- 분기 3: 유저 없음 ---

    @Test
    @DisplayName("getUserById — 존재하지 않는 유저 → USER_NOT_FOUND")
    void getUserById_withNonExistentUser_throwsUserNotFound() {
        when(userRepository.findByIdAndStatus(999L, "ROLE_REGISTERED"))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.getUserById("999"))
                .isInstanceOf(CustomException.class)
                .satisfies(e -> assertThat(((CustomException) e).getErrorCode())
                        .isEqualTo(UserErrorCode.USER_NOT_FOUND));
    }

    // --- 분기 4: 경계값 — 숫자가 아닌 id ---

    @Test
    @DisplayName("getUserById — 숫자가 아닌 id → USER_NOT_FOUND")
    void getUserById_withNonNumericId_throwsUserNotFound() {
        assertThatThrownBy(() -> userService.getUserById("abc"))
                .isInstanceOf(CustomException.class)
                .satisfies(e -> assertThat(((CustomException) e).getErrorCode())
                        .isEqualTo(UserErrorCode.USER_NOT_FOUND));
    }

    // --- 분기 5: 경계값 — 빈 문자열 id ---

    @Test
    @DisplayName("getUserById — 빈 문자열 id → USER_NOT_FOUND")
    void getUserById_withEmptyId_throwsUserNotFound() {
        assertThatThrownBy(() -> userService.getUserById(""))
                .isInstanceOf(CustomException.class)
                .satisfies(e -> assertThat(((CustomException) e).getErrorCode())
                        .isEqualTo(UserErrorCode.USER_NOT_FOUND));
    }

    // ======================================================
    // patchUser
    // ======================================================

    // --- 분기 1: 닉네임만 변경 ---

    @Test
    @DisplayName("patchUser — 닉네임만 변경 → 닉네임 저장, 토큰 재발급")
    void patchUser_withNicknameOnly_updatesNickname() {
        User user = createUser(1L, "oldname", "ko");
        when(userRepository.findByIdAndStatus(1L, "ROLE_REGISTERED"))
                .thenReturn(Optional.of(user));
        when(userRepository.findByNickname("newname")).thenReturn(Optional.empty());
        when(jwtUtil.createJwt(any(), any(), any(), any(), any())).thenReturn("token");

        PatchUserRequestDTO dto = new PatchUserRequestDTO();
        dto.setNickname("newname");

        userService.patchUser(dto, null);

        assertThat(user.getNickname()).isEqualTo("newname");
        verify(userRepository).save(user);
    }

    // --- 분기 2: language 변경 ---

    @Test
    @DisplayName("patchUser — language 변경 → language 저장, 토큰 재발급")
    void patchUser_withLanguage_updatesLanguage() {
        User user = createUser(1L, "testuser", "ko");
        when(userRepository.findByIdAndStatus(1L, "ROLE_REGISTERED"))
                .thenReturn(Optional.of(user));
        when(jwtUtil.createJwt(any(), any(), any(), any(), any())).thenReturn("token");

        PatchUserRequestDTO dto = new PatchUserRequestDTO();
        dto.setLanguage("en");

        userService.patchUser(dto, null);

        assertThat(user.getLanguage()).isEqualTo("en");
    }

    // --- 분기 3: 닉네임 중복 (다른 유저) ---

    @Test
    @DisplayName("patchUser — 다른 유저의 닉네임 → DUPLICATED_NICKNAME")
    void patchUser_withDuplicatedNickname_throwsDuplicatedNickname() {
        User user = createUser(1L, "myname", "ko");
        User otherUser = createUser(2L, "taken", "ko");
        when(userRepository.findByIdAndStatus(1L, "ROLE_REGISTERED"))
                .thenReturn(Optional.of(user));
        when(userRepository.findByNickname("taken")).thenReturn(Optional.of(otherUser));

        PatchUserRequestDTO dto = new PatchUserRequestDTO();
        dto.setNickname("taken");

        assertThatThrownBy(() -> userService.patchUser(dto, null))
                .isInstanceOf(CustomException.class)
                .satisfies(e -> assertThat(((CustomException) e).getErrorCode())
                        .isEqualTo(UserErrorCode.DUPLICATED_NICKNAME));
    }

    // --- 분기 4: 닉네임 본인 것 → 통과 ---

    @Test
    @DisplayName("patchUser — 본인 닉네임 그대로 → 예외 없이 통과")
    void patchUser_withOwnNickname_passes() {
        User user = createUser(1L, "myname", "ko");
        when(userRepository.findByIdAndStatus(1L, "ROLE_REGISTERED"))
                .thenReturn(Optional.of(user));
        when(userRepository.findByNickname("myname")).thenReturn(Optional.of(user));
        when(jwtUtil.createJwt(any(), any(), any(), any(), any())).thenReturn("token");

        PatchUserRequestDTO dto = new PatchUserRequestDTO();
        dto.setNickname("myname");

        ResponseEntity<ApiResponse<UserProfileResponseDTO>> result = userService.patchUser(dto, null);

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    // --- 분기 5: 잘못된 닉네임 ---

    @Test
    @DisplayName("patchUser — 잘못된 닉네임 → INVALID_NICKNAME")
    void patchUser_withInvalidNickname_throwsInvalidNickname() {
        User user = createUser(1L, "myname", "ko");
        when(userRepository.findByIdAndStatus(1L, "ROLE_REGISTERED"))
                .thenReturn(Optional.of(user));

        PatchUserRequestDTO dto = new PatchUserRequestDTO();
        dto.setNickname("");

        assertThatThrownBy(() -> userService.patchUser(dto, null))
                .isInstanceOf(CustomException.class)
                .satisfies(e -> assertThat(((CustomException) e).getErrorCode())
                        .isEqualTo(UserErrorCode.INVALID_NICKNAME));
    }

    // --- 분기 6: 경계값 — 공백만 닉네임 ---

    @Test
    @DisplayName("patchUser — 공백만 닉네임 → trim 후 빈 문자열 → INVALID_NICKNAME")
    void patchUser_withWhitespaceNickname_throwsInvalidNickname() {
        User user = createUser(1L, "myname", "ko");
        when(userRepository.findByIdAndStatus(1L, "ROLE_REGISTERED"))
                .thenReturn(Optional.of(user));

        PatchUserRequestDTO dto = new PatchUserRequestDTO();
        dto.setNickname("   ");

        assertThatThrownBy(() -> userService.patchUser(dto, null))
                .isInstanceOf(CustomException.class)
                .satisfies(e -> assertThat(((CustomException) e).getErrorCode())
                        .isEqualTo(UserErrorCode.INVALID_NICKNAME));
    }

    // --- 분기 7: 경계값 — 닉네임 50자 vs 51자 ---

    @Test
    @DisplayName("patchUser — 닉네임 50자 → 통과")
    void patchUser_withNickname50chars_passes() {
        User user = createUser(1L, "myname", "ko");
        String name50 = "a".repeat(50);
        when(userRepository.findByIdAndStatus(1L, "ROLE_REGISTERED"))
                .thenReturn(Optional.of(user));
        when(userRepository.findByNickname(name50)).thenReturn(Optional.empty());
        when(jwtUtil.createJwt(any(), any(), any(), any(), any())).thenReturn("token");

        PatchUserRequestDTO dto = new PatchUserRequestDTO();
        dto.setNickname(name50);

        ResponseEntity<ApiResponse<UserProfileResponseDTO>> result = userService.patchUser(dto, null);

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(user.getNickname()).isEqualTo(name50);
    }

    @Test
    @DisplayName("patchUser — 닉네임 51자 → INVALID_NICKNAME")
    void patchUser_withNickname51chars_throwsInvalidNickname() {
        User user = createUser(1L, "myname", "ko");
        when(userRepository.findByIdAndStatus(1L, "ROLE_REGISTERED"))
                .thenReturn(Optional.of(user));

        PatchUserRequestDTO dto = new PatchUserRequestDTO();
        dto.setNickname("a".repeat(51));

        assertThatThrownBy(() -> userService.patchUser(dto, null))
                .isInstanceOf(CustomException.class)
                .satisfies(e -> assertThat(((CustomException) e).getErrorCode())
                        .isEqualTo(UserErrorCode.INVALID_NICKNAME));
    }

    // --- 분기 8: 잘못된 language ---

    @Test
    @DisplayName("patchUser — 지원하지 않는 language → INVALID_LANGUAGE")
    void patchUser_withInvalidLanguage_throwsInvalidLanguage() {
        User user = createUser(1L, "myname", "ko");
        when(userRepository.findByIdAndStatus(1L, "ROLE_REGISTERED"))
                .thenReturn(Optional.of(user));

        PatchUserRequestDTO dto = new PatchUserRequestDTO();
        dto.setLanguage("fr");

        assertThatThrownBy(() -> userService.patchUser(dto, null))
                .isInstanceOf(CustomException.class)
                .satisfies(e -> assertThat(((CustomException) e).getErrorCode())
                        .isEqualTo(UserErrorCode.INVALID_LANGUAGE));
    }

    // --- 분기 9: 경계값 — description 150자 vs 151자 ---

    @Test
    @DisplayName("patchUser — description 150자 → 통과")
    void patchUser_withDescription150chars_passes() {
        User user = createUser(1L, "myname", "ko");
        when(userRepository.findByIdAndStatus(1L, "ROLE_REGISTERED"))
                .thenReturn(Optional.of(user));
        when(jwtUtil.createJwt(any(), any(), any(), any(), any())).thenReturn("token");

        PatchUserRequestDTO dto = new PatchUserRequestDTO();
        dto.setDescription("a".repeat(150));

        ResponseEntity<ApiResponse<UserProfileResponseDTO>> result = userService.patchUser(dto, null);

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    @DisplayName("patchUser — description 151자 → INVALD_VALUE")
    void patchUser_withDescription151chars_throwsInvalidValue() {
        User user = createUser(1L, "myname", "ko");
        when(userRepository.findByIdAndStatus(1L, "ROLE_REGISTERED"))
                .thenReturn(Optional.of(user));

        PatchUserRequestDTO dto = new PatchUserRequestDTO();
        dto.setDescription("a".repeat(151));

        assertThatThrownBy(() -> userService.patchUser(dto, null))
                .isInstanceOf(CustomException.class)
                .satisfies(e -> assertThat(((CustomException) e).getErrorCode())
                        .isEqualTo(UserErrorCode.INVALD_VALUE));
    }

    // --- 분기 10: 유저 없음 ---

    @Test
    @DisplayName("patchUser — 유저 없음 → USER_NOT_FOUND")
    void patchUser_withNonExistentUser_throwsUserNotFound() {
        when(userRepository.findByIdAndStatus(1L, "ROLE_REGISTERED"))
                .thenReturn(Optional.empty());

        PatchUserRequestDTO dto = new PatchUserRequestDTO();
        dto.setNickname("newname");

        assertThatThrownBy(() -> userService.patchUser(dto, null))
                .isInstanceOf(CustomException.class)
                .satisfies(e -> assertThat(((CustomException) e).getErrorCode())
                        .isEqualTo(UserErrorCode.USER_NOT_FOUND));
    }

    // ======================================================
    // deleteUser
    // ======================================================

    // --- 분기 1: 정상 삭제 ---

    @Test
    @DisplayName("deleteUser — 정상 → delete + tokenDelete + 204 + 쿠키 무효화")
    void deleteUser_withExistingUser_deletesAndReturns204() {
        User user = createUser(1L, "testuser", "ko");
        when(userRepository.findByIdAndStatus(1L, "ROLE_REGISTERED"))
                .thenReturn(Optional.of(user));

        ResponseEntity<ApiResponse<Void>> result = userService.deleteUser();

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
        verify(userRepository).delete(user);
        verify(tokenRepository).deleteById(1L);
        assertThat(result.getHeaders().get(HttpHeaders.SET_COOKIE)).isNotNull();
    }

    // --- 분기 2: 유저 없음 ---

    @Test
    @DisplayName("deleteUser — 유저 없음 → USER_NOT_FOUND")
    void deleteUser_withNonExistentUser_throwsUserNotFound() {
        when(userRepository.findByIdAndStatus(1L, "ROLE_REGISTERED"))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.deleteUser())
                .isInstanceOf(CustomException.class)
                .satisfies(e -> assertThat(((CustomException) e).getErrorCode())
                        .isEqualTo(UserErrorCode.USER_NOT_FOUND));
    }
}
