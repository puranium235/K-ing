package com.king.backend.domain.user.jwt;

import com.king.backend.global.exception.CustomException;
import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JWTUtilTest {

    private JWTUtil jwtUtil;

    @BeforeEach
    void setUp() {
        String testSecret = "test-secret-key-for-jwt-unit-testing-must-be-at-least-256-bits-long-enough";
        jwtUtil = new JWTUtil(testSecret);
    }

    @Test
    @DisplayName("createJwt — 유효한 JWT 토큰을 생성한다")
    void createJwt_생성_성공() {
        String token = jwtUtil.createJwt("accessToken", "1", "ko", "ROLE_REGISTERED", 60000L);

        assertThat(token).isNotNull();
        assertThat(token.split("\\.")).hasSize(3);
    }

    @Test
    @DisplayName("validToken — 유효한 토큰의 Claims를 반환한다")
    void validToken_유효한_토큰() {
        String token = jwtUtil.createJwt("accessToken", "1", "ko", "ROLE_REGISTERED", 60000L);

        Claims claims = jwtUtil.validToken(token);

        assertThat(claims).isNotNull();
        assertThat(claims.get("type", String.class)).isEqualTo("accessToken");
        assertThat(claims.get("userId", String.class)).isEqualTo("1");
    }

    @Test
    @DisplayName("validToken — 만료된 토큰은 CustomException을 던진다")
    void validToken_만료된_토큰() {
        String token = jwtUtil.createJwt("accessToken", "1", "ko", "ROLE_REGISTERED", -1000L);

        assertThatThrownBy(() -> jwtUtil.validToken(token))
                .isInstanceOf(CustomException.class);
    }

    @Test
    @DisplayName("validToken — 잘못된 토큰은 CustomException을 던진다")
    void validToken_잘못된_토큰() {
        assertThatThrownBy(() -> jwtUtil.validToken("invalid.token.value"))
                .isInstanceOf(CustomException.class);
    }

    @Test
    @DisplayName("getUserId — 토큰에서 userId를 추출한다")
    void getUserId_정상() {
        String token = jwtUtil.createJwt("accessToken", "42", "en", "ROLE_REGISTERED", 60000L);

        assertThat(jwtUtil.getUserId(token)).isEqualTo("42");
    }

    @Test
    @DisplayName("getRole — 토큰에서 role을 추출한다")
    void getRole_정상() {
        String token = jwtUtil.createJwt("accessToken", "1", "ko", "ROLE_PENDING", 60000L);

        assertThat(jwtUtil.getRole(token)).isEqualTo("ROLE_PENDING");
    }

    @Test
    @DisplayName("getLanguage — 토큰에서 language를 추출한다")
    void getLanguage_정상() {
        String token = jwtUtil.createJwt("accessToken", "1", "ja", "ROLE_REGISTERED", 60000L);

        assertThat(jwtUtil.getLanguage(token)).isEqualTo("ja");
    }

    @Test
    @DisplayName("getType — 토큰에서 type을 추출한다")
    void getType_정상() {
        String token = jwtUtil.createJwt("refreshToken", "1", "ko", "ROLE_REGISTERED", 60000L);

        assertThat(jwtUtil.getType(token)).isEqualTo("refreshToken");
    }
}
