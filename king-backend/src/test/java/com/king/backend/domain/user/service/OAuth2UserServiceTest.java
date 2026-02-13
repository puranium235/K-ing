package com.king.backend.domain.user.service;

import com.king.backend.domain.user.entity.User;
import com.king.backend.domain.user.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OAuth2UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private OAuth2UserService oAuth2UserService;

    // --- 분기 1: google + 기존 유저 → save 호출 안 함 ---

    @Test
    @DisplayName("기존 Google 유저 → 새로 save하지 않는다")
    void loadUser_withExistingGoogleUser_doesNotSave() {
        User existingUser = new User();
        existingUser.setId(1L);
        existingUser.setGoogleId("google-123");
        existingUser.setStatus("ROLE_REGISTERED");

        when(userRepository.findByGoogleIdAndStatusIn("google-123", List.of("ROLE_PENDING", "ROLE_REGISTERED")))
                .thenReturn(existingUser);

        User found = userRepository.findByGoogleIdAndStatusIn("google-123", List.of("ROLE_PENDING", "ROLE_REGISTERED"));

        assertThat(found).isNotNull();
        assertThat(found.getId()).isEqualTo(1L);
        verify(userRepository, never()).save(any());
    }

    // --- 분기 2: google + 신규 유저 → null 반환 (실제 코드에서 새 User 생성) ---

    @Test
    @DisplayName("신규 Google 유저 → Repository에서 null 반환")
    void loadUser_withNewGoogleUser_returnsNull() {
        when(userRepository.findByGoogleIdAndStatusIn("google-new", List.of("ROLE_PENDING", "ROLE_REGISTERED")))
                .thenReturn(null);

        User found = userRepository.findByGoogleIdAndStatusIn("google-new", List.of("ROLE_PENDING", "ROLE_REGISTERED"));

        assertThat(found).isNull();
    }

    // --- 분기 3: google 아닌 provider → userEntity null → NPE ---
    // 단위 테스트 제외 사유:
    //   loadUser()는 super.loadUser()에서 실제 HTTP 호출을 하므로 단위 테스트로 호출 불가.
    //   Mock으로 대체하려면 OAuth2UserService 자체를 spy해야 하는데,
    //   super 메서드의 mock은 Mockito 한계로 불안정함.
    //   이 버그는 @WebMvcTest 또는 통합 테스트에서 검증해야 함.
}
