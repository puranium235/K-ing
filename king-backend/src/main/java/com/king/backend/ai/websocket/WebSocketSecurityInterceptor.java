package com.king.backend.ai.websocket;

import com.king.backend.domain.user.dto.domain.OAuth2UserDTO;
import com.king.backend.domain.user.jwt.JWTUtil;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class WebSocketSecurityInterceptor implements HandshakeInterceptor {

    private final JWTUtil jwtUtil;

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                   WebSocketHandler wsHandler, Map<String, Object> attributes) {
        log.info("🛠️ WebSocket 핸드셰이크 요청 수신...");
        log.info("🔎 요청 정보: URI={}, Headers={}", request.getURI(), request.getHeaders());

        if (request instanceof ServletServerHttpRequest servletRequest) {
            HttpServletRequest httpRequest = servletRequest.getServletRequest();
            String token = httpRequest.getParameter("token");

            if (token == null || token.isEmpty()) {
                log.warn("🚨 WebSocket 핸드셰이크 실패: 토큰 없음");
                return false;
            }

            try {
                Claims claims = jwtUtil.validToken(token);
                String userId = claims.get("userId", String.class);
                String role = claims.get("role", String.class);

                log.info("✅ WebSocket 인증 성공: userId={}, role={}", userId, role);

                // WebSocket 세션에 사용자 정보 저장
                attributes.put("userId", userId);
                attributes.put("role", role);

                // 🔥 SecurityContext 설정 (WebSocket 요청을 Spring Security에서 인증할 수 있도록 함)
                SecurityContext securityContext = SecurityContextHolder.createEmptyContext();
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(userId, null,
                                Collections.singletonList(new SimpleGrantedAuthority(role)));

                securityContext.setAuthentication(authentication);
                SecurityContextHolder.setContext(securityContext);

                log.info("🔒 SecurityContext 설정 완료: userId={}, role={}", userId, role);

            } catch (Exception e) {
                log.error("❌ WebSocket 인증 실패: {}", e.getMessage(), e);
                return false;
            }
        }
        return true;
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                               WebSocketHandler wsHandler, Exception exception) {
        log.info("✅ WebSocket 핸드셰이크 완료");
    }
}

