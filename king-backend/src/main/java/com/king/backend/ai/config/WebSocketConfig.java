package com.king.backend.ai.config;

import com.king.backend.ai.websocket.ChatWebSocketHandler;
import com.king.backend.ai.websocket.WebSocketSecurityInterceptor;
import com.king.backend.domain.user.jwt.JWTUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Slf4j
@Configuration
@EnableWebSocket
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketConfigurer {

    private final ChatWebSocketHandler chatWebSocketHandler;
    private final WebSocketSecurityInterceptor webSocketSecurityInterceptor;

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        log.info("✅ WebSocket 핸들러 등록: /api/ws/chatbot");
        registry.addHandler(chatWebSocketHandler, "/api/ws/chatbot")
                .setAllowedOrigins("*")
                .addInterceptors(webSocketSecurityInterceptor);
    }
}


