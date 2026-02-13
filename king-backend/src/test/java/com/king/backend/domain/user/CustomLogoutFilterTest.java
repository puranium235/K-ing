package com.king.backend.domain.user;

import com.king.backend.domain.user.jwt.JWTUtil;
import com.king.backend.domain.user.repository.TokenRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CustomLogoutFilterTest {

    @Mock
    private JWTUtil jwtUtil;

    @Mock
    private TokenRepository tokenRepository;

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpServletResponse response;

    @Mock
    private FilterChain filterChain;

    private CustomLogoutFilter logoutFilter;

    @BeforeEach
    void setUp() {
        logoutFilter = new CustomLogoutFilter(jwtUtil, tokenRepository);
    }

    // --- 분기 1: URI 불일치 → filterChain 통과 ---

    @Test
    @DisplayName("다른 URI 요청 → filterChain.doFilter 호출")
    void doFilter_withNonLogoutUri_passesThrough() throws Exception {
        when(request.getRequestURI()).thenReturn("/api/user/profile");

        logoutFilter.doFilter(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        verify(tokenRepository, never()).deleteById(any());
    }

    // --- 분기 2: POST 아님 → filterChain 통과 ---

    @Test
    @DisplayName("GET /api/user/logout → filterChain.doFilter 호출")
    void doFilter_withGetMethod_passesThrough() throws Exception {
        when(request.getRequestURI()).thenReturn("/api/user/logout");
        when(request.getMethod()).thenReturn("GET");

        logoutFilter.doFilter(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        verify(tokenRepository, never()).deleteById(any());
    }

    // --- 분기 3: cookies null → NPE (bugfix) ---

    @Test
    @Tag("bugfix")
    @DisplayName("[bugfix] 쿠키 배열 null → NPE 발생하지 않아야 함")
    void doFilter_withNullCookies_doesNotThrowNpe() throws Exception {
        when(request.getRequestURI()).thenReturn("/api/user/logout");
        when(request.getMethod()).thenReturn("POST");
        when(request.getCookies()).thenReturn(null);

        logoutFilter.doFilter(request, response, filterChain);

        verify(response).setStatus(HttpServletResponse.SC_BAD_REQUEST);
    }

    // --- 분기 4: refreshToken 쿠키 없음 → 400 ---

    @Test
    @DisplayName("refreshToken 쿠키 없음 → 400")
    void doFilter_withNoRefreshTokenCookie_returns400() throws Exception {
        when(request.getRequestURI()).thenReturn("/api/user/logout");
        when(request.getMethod()).thenReturn("POST");
        when(request.getCookies()).thenReturn(new Cookie[]{new Cookie("other", "value")});

        logoutFilter.doFilter(request, response, filterChain);

        verify(response).setStatus(HttpServletResponse.SC_BAD_REQUEST);
    }

    // --- 분기 4 경계값: 빈 쿠키 배열 ---

    @Test
    @DisplayName("빈 쿠키 배열 → 400")
    void doFilter_withEmptyCookieArray_returns400() throws Exception {
        when(request.getRequestURI()).thenReturn("/api/user/logout");
        when(request.getMethod()).thenReturn("POST");
        when(request.getCookies()).thenReturn(new Cookie[]{});

        logoutFilter.doFilter(request, response, filterChain);

        verify(response).setStatus(HttpServletResponse.SC_BAD_REQUEST);
    }

    // --- 분기 5: 토큰 만료 → 400 ---

    @Test
    @DisplayName("만료된 refreshToken → 400")
    void doFilter_withExpiredToken_returns400() throws Exception {
        when(request.getRequestURI()).thenReturn("/api/user/logout");
        when(request.getMethod()).thenReturn("POST");
        when(request.getCookies()).thenReturn(new Cookie[]{new Cookie("refreshToken", "expired-token")});
        doThrow(new io.jsonwebtoken.ExpiredJwtException(null, null, "expired"))
                .when(jwtUtil).validToken("expired-token");

        logoutFilter.doFilter(request, response, filterChain);

        verify(response).setStatus(HttpServletResponse.SC_BAD_REQUEST);
    }

    // --- 분기 6: type이 refreshToken 아님 → 400 ---

    @Test
    @DisplayName("type이 accessToken인 토큰 → 400")
    void doFilter_withAccessTokenType_returns400() throws Exception {
        when(request.getRequestURI()).thenReturn("/api/user/logout");
        when(request.getMethod()).thenReturn("POST");
        when(request.getCookies()).thenReturn(new Cookie[]{new Cookie("refreshToken", "access-type-token")});
        when(jwtUtil.getType("access-type-token")).thenReturn("accessToken");

        logoutFilter.doFilter(request, response, filterChain);

        verify(response).setStatus(HttpServletResponse.SC_BAD_REQUEST);
    }

    // --- 분기 7: tokenRepository에 없음 → 400 but return 누락 ---

    @Test
    @DisplayName("토큰이 Redis에 없음 → 400 응답하지만 이후 로직도 실행됨 (return 누락 버그)")
    void doFilter_withTokenNotInRedis_returns400ButContinues() throws Exception {
        when(request.getRequestURI()).thenReturn("/api/user/logout");
        when(request.getMethod()).thenReturn("POST");
        when(request.getCookies()).thenReturn(new Cookie[]{new Cookie("refreshToken", "valid-token")});
        when(jwtUtil.getType("valid-token")).thenReturn("refreshToken");
        when(jwtUtil.getUserId("valid-token")).thenReturn("1");
        when(tokenRepository.existsById(1L)).thenReturn(false);

        logoutFilter.doFilter(request, response, filterChain);

        // return 누락으로 400 세팅 후에도 deleteById + 200이 실행됨
        verify(response).setStatus(HttpServletResponse.SC_BAD_REQUEST);
        verify(tokenRepository).deleteById(1L);
        verify(response).setStatus(HttpServletResponse.SC_OK);
    }

    // --- 분기 8: 정상 로그아웃 ---

    @Test
    @DisplayName("정상 로그아웃 → 토큰 삭제, 쿠키 무효화, 200")
    void doFilter_withValidLogout_deletesTokenAndReturns200() throws Exception {
        when(request.getRequestURI()).thenReturn("/api/user/logout");
        when(request.getMethod()).thenReturn("POST");
        when(request.getCookies()).thenReturn(new Cookie[]{new Cookie("refreshToken", "valid-token")});
        when(jwtUtil.getType("valid-token")).thenReturn("refreshToken");
        when(jwtUtil.getUserId("valid-token")).thenReturn("1");
        when(tokenRepository.existsById(1L)).thenReturn(true);

        logoutFilter.doFilter(request, response, filterChain);

        verify(tokenRepository).deleteById(1L);
        verify(response).addCookie(argThat(cookie ->
                cookie.getName().equals("refreshToken")
                        && cookie.getValue() == null
                        && cookie.getMaxAge() == 0));
        verify(response).setStatus(HttpServletResponse.SC_OK);
        verify(filterChain, never()).doFilter(request, response);
    }
}
