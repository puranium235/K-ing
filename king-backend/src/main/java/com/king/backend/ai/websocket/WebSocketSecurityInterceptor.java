package com.king.backend.ai.config;

import com.king.backend.domain.user.jwt.JWTUtil;
import com.king.backend.domain.user.dto.domain.OAuth2UserDTO;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;

import java.util.List;
import java.util.Map;

@Slf4j
@RequiredArgsConstructor
public class WebSocketSecurityInterceptor implements HandshakeInterceptor {

    private final JWTUtil jwtUtil; // ✅ JWT 유틸을 생성자로 주입

    @Override
    public boolean beforeHandshake(
            ServerHttpRequest request,
            ServerHttpResponse response,
            WebSocketHandler wsHandler,
            Map<String, Object> attributes) {

        if (request instanceof ServletServerHttpRequest servletRequest) {
            HttpServletRequest httpRequest = servletRequest.getServletRequest();
            String token = httpRequest.getParameter("token"); // ✅ URL에서 토큰 가져오기

            if (token == null || token.isEmpty()) {
                log.warn("🚨 WebSocket 연결 차단됨: 토큰 없음");
                return false;
            }

            log.info("🔍 WebSocket 요청: 받은 토큰 = {}", token);

            try {
                Claims claims = jwtUtil.validToken(token); // ✅ JWT 검증

                String userId = claims.get("userId", String.class);
                String role = claims.get("role", String.class);

                OAuth2UserDTO oAuth2UserDTO = new OAuth2UserDTO();
                oAuth2UserDTO.setName(userId);
                oAuth2UserDTO.setAuthorities(List.of(new SimpleGrantedAuthority(role)));

                Authentication authToken = new UsernamePasswordAuthenticationToken(
                        oAuth2UserDTO, null, oAuth2UserDTO.getAuthorities());

                // ✅ Spring Security의 SecurityContextHolder에 인증 정보 저장
                SecurityContext context = SecurityContextHolder.createEmptyContext();
                context.setAuthentication(authToken);
                SecurityContextHolder.setContext(context);

                log.info("✅ WebSocket 인증 성공: userId = {}, role = {}", userId, role);
                attributes.put("userId", userId); // ✅ WebSocket 세션에 userId 저장

            } catch (Exception e) {
                log.error("❌ WebSocket 인증 실패: {}", e.getMessage());
                return false;
            }
        }
        return true;
    }

    @Override
    public void afterHandshake(
            ServerHttpRequest request,
            ServerHttpResponse response,
            WebSocketHandler wsHandler,
            Exception exception) {
        log.info("✅ WebSocket 핸드셰이크 완료");
    }
}
