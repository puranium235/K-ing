package com.king.backend.ai.controller;

import com.king.backend.ai.dto.ChatHistory;
import com.king.backend.ai.service.ChatService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequiredArgsConstructor
@Tag(name = "AI 컨트롤러", description = "chatGPT 챗봇 API")
@RequestMapping("/chatbot")
public class AIController {
    private final ChatService chatService;

    @GetMapping("/")
    public ResponseEntity<List<ChatHistory>> getChatHistory() {
        return ResponseEntity.ok(chatService.getChatHistory());
    }

    @DeleteMapping("/")
    public ResponseEntity<String> deleteChatHistory() {
        chatService.deleteChatHistory();
        return ResponseEntity.ok("대화 기록이 삭제되었습니다.");
    }

    @PostMapping("/save")
    public ResponseEntity<String> saveChatHistory(@RequestBody ChatHistory chatHistory) {
        chatService.saveChatHistory(chatHistory);
        return ResponseEntity.ok("대화 기록이 저장되었습니다.");
    }

    @Operation(summary = "AI 챗봇과 T 대화", description = "사용자가 입력한 메시지를 기반으로 AI 챗봇이 논리적으로 응답을 생성합니다.")
    @PostMapping("/chatT")
    public ResponseEntity<Map<String, Object>> chatT(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "사용자가 입력한 메시지", required = true, content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(example = "{ \"userMessage\": \"안녕!\" }")
            ))
            @RequestBody Map<String, String> requestBody) {
        try {
            String userMessage = requestBody.get("userMessage");
            return ResponseEntity.ok(chatService.chatT(userMessage));
        } catch (Exception e) {
            log.error("Error occurred in /chatT endpoint: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @Operation(summary = "AI 챗봇과 F 대화", description = "사용자가 입력한 메시지를 기반으로 AI 챗봇이 감성적으로 응답을 생성합니다.")
    @PostMapping("/chatF")
    public ResponseEntity<Map<String, Object>> chatF(@RequestBody Map<String, String> requestBody) {
        try {
            String userMessage = requestBody.get("userMessage");
            return ResponseEntity.ok(chatService.chatF(userMessage));
        } catch (Exception e) {
            log.error("Error occurred in /chatF endpoint: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    // 🔹 논리적 챗봇 (Chat T) - 스트리밍 방식
    @PostMapping(value = "/streamT", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public ResponseEntity<Flux<String>> streamChatT(
            @RequestBody Map<String, String> requestBody,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        log.info("🔍 Authorization Header: {}", authHeader);

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.warn("🚨 401 Unauthorized - Missing or Invalid Token");
            return ResponseEntity.status(401).body(Flux.just("Unauthorized: Missing token"));
        }

        try {
            String userMessage = requestBody.get("userMessage");
            log.info("📩 User Message Received: {}", userMessage);

            // 🔹 OpenAI 스트리밍 응답을 Flux<String>으로 반환
            Flux<String> responseStream = chatService.streamChatT(userMessage);

            return ResponseEntity.ok().body(Flux.concat(
                    Flux.just("[START]"), // ✅ 시작 신호
                    responseStream, // ✅ 스트리밍 데이터
                    Flux.just("[END]")  // ✅ 종료 신호 (프론트에서 종료 확인 가능)
            ));
        } catch (Exception e) {
            log.error("❌ Error in /streamT endpoint: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Flux.just("{\"error\": \"" + e.getMessage() + "\"}"));
        }
    }



    // 🔹 감성적 챗봇 (Chat F) - 스트리밍 방식
    @PostMapping(value = "/streamF", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public ResponseEntity<Flux<ServerSentEvent<String>>> streamF(
            @RequestBody Map<String, String> requestBody) {
        try {
            String userMessage = requestBody.get("userMessage");

            // 🔹 `Flux<String>`을 `ServerSentEvent<String>`으로 변환하여 JSON 직렬화 문제 해결
            Flux<ServerSentEvent<String>> eventStream = chatService.streamChatF(userMessage)
                    .map(data -> ServerSentEvent.builder(data).build());

            return ResponseEntity.ok(eventStream);
        } catch (Exception e) {
            log.error("Error occurred in /streamF endpoint: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Flux.just(ServerSentEvent.builder("Error: " + e.getMessage()).build()));
        }
    }

}
