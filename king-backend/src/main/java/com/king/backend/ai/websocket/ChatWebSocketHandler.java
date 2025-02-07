package com.king.backend.ai.websocket;

import com.king.backend.ai.service.ChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;

import org.springframework.web.socket.handler.TextWebSocketHandler;
import reactor.core.publisher.Flux;
import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
@RequiredArgsConstructor
public class ChatWebSocketHandler extends TextWebSocketHandler {

    private final ChatService chatService;
    private final Map<String, WebSocketSession> sessions = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        String userId = (String) session.getAttributes().get("userId");

        if (userId == null) {
            log.warn("❌ WebSocket 연결 실패 - 사용자 정보 없음");
            return;
        }

        sessions.put(userId, session);
        log.info("✅ WebSocket 연결 성공 - 사용자 ID: {}", userId);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        String userId = (String) session.getAttributes().get("userId");

        if (userId != null) {
            sessions.remove(userId);
            log.info("❌ WebSocket 연결 종료 - 사용자 ID: {}", userId);
        }
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) {
        log.error("❌ WebSocket 오류 발생: sessionId={}, error={}", session.getId(), exception.getMessage(), exception);
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws IOException {
        String userId = (String) session.getAttributes().get("userId");

        if (userId == null) {
            log.warn("❌ WebSocket 메시지 처리 실패 - 사용자 정보 없음");
            return;
        }

        log.info("📨 WebSocket 메시지 수신 - 사용자 ID: {}, 메시지: {}", userId, message.getPayload());
//        try {
//            Map<String, Object> response = chatService.chatT(message.getPayload(), userId);
//            session.sendMessage(new TextMessage(response.toString()));
//        } catch (IOException e) {
//            log.error("❌ WebSocket 메시지 전송 실패", e);
//        }
        // 🔹 OpenAI API 스트리밍 호출
        Flux<String> responseStream = chatService.streamChatT(message.getPayload(), userId);

        // 🔹 WebSocket을 통해 클라이언트로 실시간 전송
        responseStream.subscribe(
                chunk -> sendToClient(session, chunk), // 🔹 OpenAI 응답을 WebSocket으로 전송
                error -> log.error("❌ OpenAI 스트리밍 오류 발생", error),
                () -> sendToClient(session, "[END]") // ✅ 스트리밍 종료 신호 전송
        );
    }

    private void sendToClient(WebSocketSession session, String message) {
        try {
            session.sendMessage(new TextMessage(message));
        } catch (IOException e) {
            log.error("❌ WebSocket 메시지 전송 실패", e);
        }
    }
}
