package com.king.backend.domain.user.jwt;

import com.king.backend.domain.user.errorcode.UserErrorCode;
import com.king.backend.domain.user.errorcode.UserErrorCode;
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

    // --- createJwt ---

    @Test
    @DisplayName("createJwt — 유효한 JWT 토큰을 생성한다")
    void createJwt_returnsValidJwtFormat() {
        String token = jwtUtil.createJwt("accessToken", "1", "ko", "ROLE_REGISTERED", 60000L);

        assertThat(token).isNotNull();
        assertThat(token.split("\\.")).hasSize(3);
    }

    // --- validToken: 분기 3개 (정상 / 만료 / 기타 에러) ---

    @Test
    @DisplayName("validToken — 유효한 토큰의 Claims를 반환한다")
    void validToken_withValidToken_returnsClaims() {
        String token = jwtUtil.createJwt("accessToken", "1", "ko", "ROLE_REGISTERED", 60000L);

        Claims claims = jwtUtil.validToken(token);

        assertThat(claims).isNotNull();
        assertThat(claims.get("type", String.class)).isEqualTo("accessToken");
        assertThat(claims.get("userId", String.class)).isEqualTo("1");
    }

    @Test
    @DisplayName("validToken — 만료된 토큰은 ACCESSTOKEN_EXPIRED 예외를 던진다")
    void validToken_withExpiredToken_throwsAccessTokenExpired() {
        String token = jwtUtil.createJwt("accessToken", "1", "ko", "ROLE_REGISTERED", -1000L);

        assertThatThrownBy(() -> jwtUtil.validToken(token))
                .isInstanceOf(CustomException.class)
                .satisfies(e -> assertThat(((CustomException) e).getErrorCode())
                        .isEqualTo(UserErrorCode.ACCESSTOKEN_EXPIRED));
    }

    @Test
    @DisplayName("validToken — 잘못된 토큰은 INVALID_TOKEN 예외를 던진다")
    void validToken_withMalformedToken_throwsInvalidToken() {
        assertThatThrownBy(() -> jwtUtil.validToken("invalid.token.value"))
                .isInstanceOf(CustomException.class)
                .satisfies(e -> assertThat(((CustomException) e).getErrorCode())
                        .isEqualTo(UserErrorCode.INVALID_TOKEN));
    }

    // --- validToken: 경계값 (만료시간 0, null, 빈 문자열) ---

    @Test
    @DisplayName("validToken — 만료시간 0 경계값은 즉시 만료 처리된다")
    void validToken_withZeroExpiry_throwsException() {
        String token = jwtUtil.createJwt("accessToken", "1", "ko", "ROLE_REGISTERED", 0L);

        assertThatThrownBy(() -> jwtUtil.validToken(token))
                .isInstanceOf(CustomException.class);
    }

    @Test
    @DisplayName("validToken — null 토큰은 INVALID_TOKEN 예외를 던진다")
    void validToken_withNull_throwsInvalidToken() {
        assertThatThrownBy(() -> jwtUtil.validToken(null))
                .isInstanceOf(CustomException.class)
                .satisfies(e -> assertThat(((CustomException) e).getErrorCode())
                        .isEqualTo(UserErrorCode.INVALID_TOKEN));
    }

    @Test
    @DisplayName("validToken — 빈 문자열 토큰은 INVALID_TOKEN 예외를 던진다")
    void validToken_withEmptyString_throwsInvalidToken() {
        assertThatThrownBy(() -> jwtUtil.validToken(""))
                .isInstanceOf(CustomException.class)
                .satisfies(e -> assertThat(((CustomException) e).getErrorCode())
                        .isEqualTo(UserErrorCode.INVALID_TOKEN));
    }

    // --- getter 메서드 ---

    @Test
    @DisplayName("getUserId — 토큰에서 userId를 추출한다")
    void getUserId_returnsCorrectUserId() {
        String token = jwtUtil.createJwt("accessToken", "42", "en", "ROLE_REGISTERED", 60000L);

        assertThat(jwtUtil.getUserId(token)).isEqualTo("42");
    }

    @Test
    @DisplayName("getRole — 토큰에서 role을 추출한다")
    void getRole_returnsCorrectRole() {
        String token = jwtUtil.createJwt("accessToken", "1", "ko", "ROLE_PENDING", 60000L);

        assertThat(jwtUtil.getRole(token)).isEqualTo("ROLE_PENDING");
    }

    @Test
    @DisplayName("getLanguage — 토큰에서 language를 추출한다")
    void getLanguage_returnsCorrectLanguage() {
        String token = jwtUtil.createJwt("accessToken", "1", "ja", "ROLE_REGISTERED", 60000L);

        assertThat(jwtUtil.getLanguage(token)).isEqualTo("ja");
    }

    @Test
    @DisplayName("getType — 토큰에서 type을 추출한다")
    void getType_returnsCorrectType() {
        String token = jwtUtil.createJwt("refreshToken", "1", "ko", "ROLE_REGISTERED", 60000L);

        assertThat(jwtUtil.getType(token)).isEqualTo("refreshToken");
    }
}
