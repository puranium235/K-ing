package com.king.backend.ai.controller;

import com.king.backend.ai.dto.ChatHistory;
import com.king.backend.ai.service.ChatHistoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequiredArgsConstructor
@Tag(name = "AI 컨트롤러", description = "chatGPT 챗봇 API")
@RequestMapping("/chatbot")
public class AIController {

    private final ChatHistoryService chatHistoryService;
    private final OpenAiChatModel chatModel;

    private Long getUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return Long.parseLong(authentication.getName());
    }

    /**
     * ✅ 유저의 대화 기록을 불러옴 (최신순)
     */
    @GetMapping("/")
    public ResponseEntity<List<ChatHistory>> getChatHistory() {
        List<ChatHistory> chatHistoryList = chatHistoryService.findByUserId(getUserId());
        return ResponseEntity.ok(chatHistoryList);
    }

    /**
     * ✅ 유저의 대화 기록을 삭제
     */
    @DeleteMapping("/")
    public ResponseEntity<String> deleteChatHistory() {
        chatHistoryService.deleteByUserId(getUserId());
        return ResponseEntity.ok("대화 기록이 삭제되었습니다.");
    }

    /**
     * ✅ 특정 채팅 메시지를 저장
     */
    @PostMapping("/save")
    public ResponseEntity<String> saveChatHistory(@RequestBody ChatHistory chatHistory) {
        chatHistoryService.saveChatHistory(getUserId(), chatHistory.getRole(), chatHistory.getContent(), chatHistory.getType());
        return ResponseEntity.ok("대화 기록이 저장되었습니다.");
    }

    /**
     * ✅ AI 챗봇과의 대화 엔드포인트
     */
    @Operation(
            summary = "AI 챗봇과 대화",
            description = "사용자가 입력한 메시지를 기반으로 AI 챗봇이 응답을 생성합니다."
    )
    @PostMapping("/chat")
    public ResponseEntity<Map<String, Object>> chat(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "사용자가 입력한 메시지", required = true, content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(example = "{ \"userMessage\": \"안녕!\" }")
            ))
            @RequestBody Map<String, String> requestBody) {

        try {
            String userMessage = requestBody.get("userMessage");

            // ✅ DB에서 대화 히스토리 가져오기
            List<ChatHistory> chatHistoryList = chatHistoryService.findByUserId(getUserId());
            List<Map<String, String>> dialogueHistory = convertChatHistoryToDialogueHistory(chatHistoryList);

            if (userMessage != null && !userMessage.trim().isEmpty()) {
                chatHistoryService.saveChatHistory(getUserId(), "user", userMessage, "message");

                Map<String, String> userMessageMap = Map.of("role", "user", "content", userMessage);
                dialogueHistory.add(userMessageMap);

                // ✅ GPT 프롬프트 생성 및 호출
                String prompt = generatePrompt(dialogueHistory);
                ChatResponse chatResponse = chatModel.call(
                        new Prompt(new UserMessage(prompt),
                                OpenAiChatOptions.builder()
                                        .model("gpt-4o-mini")
                                        .temperature(0.7)
                                        .build()
                        )
                );

                String gptResponse = chatResponse.getResults().get(0).getOutput().getText();

                // ✅ GPT 응답 저장
                chatHistoryService.saveChatHistory(getUserId(), "assistant", gptResponse, "message");

                Map<String, Object> responseBody = new HashMap<>();
                responseBody.put("message", gptResponse);
                responseBody.put("dialogueHistory", dialogueHistory);

                return ResponseEntity.ok(responseBody);
            }

            return ResponseEntity.ok(Map.of("dialogueHistory", dialogueHistory));
        } catch (Exception e) {
            log.error("Error occurred in /chat endpoint: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    private List<Map<String, String>> convertChatHistoryToDialogueHistory(List<ChatHistory> chatHistoryList) {
        return chatHistoryList.stream()
                .filter(chat -> "message".equals(chat.getType()))
                .map(chat -> Map.of(
                        "role", chat.getRole(),
                        "content", chat.getContent()
                ))
                .collect(Collectors.toList());
    }

    private String generatePrompt(List<Map<String, String>> dialogueHistory) {
        StringBuilder promptBuilder = new StringBuilder();
        promptBuilder.append("<dialogue history>\n");
        for (Map<String, String> message : dialogueHistory) {
            promptBuilder.append(message.get("role")).append(": ").append(message.get("content")).append("\n");
        }
        promptBuilder.append(
                """
                        <instruction>
                        당신은 친절한 AI 챗봇 'King' 입니다.
                        위 대화를 바탕으로 사용자의 요구를 분석하고 적절히 응답하세요.
                        사용자는 한국 드라마, 영화, 예능, K-POP, 연예인 등에 관심이 많으며, 관련 주제로 가볍고 재미있는 대화를 나누고 싶어합니다.
                        당신의 목표는 사용자가 편안하게 이야기할 수 있도록 친근한 말투로 응답하고, 한국 콘텐츠와 관련된 흥미로운 대화를 이어가는 것입니다.
                        
                        대화 스타일:
                        - 따뜻하고 친근한 말투 사용
                        - 사용자의 관심사(최애 배우, 드라마, K-POP 그룹 등)에 맞춰 공감형 응답 제공
                        - 질문을 던지며 자연스럽게 대화 유도
                        - 문장은 짧고 간결하게 표현
                        </instruction>"""
        );
        return promptBuilder.toString();
    }

    private String generateTChatBotPrompt(List<Map<String, String>> dialogueHistory) {
        StringBuilder promptBuilder = new StringBuilder();
        promptBuilder.append("<dialogue history>\n");
        for (Map<String, String> message : dialogueHistory) {
            promptBuilder.append(message.get("role")).append(": ").append(message.get("content")).append("\n");
        }
        promptBuilder.append(
                """
                        <instruction>
                        당신은 논리적이고 분석적인 AI 챗봇입니다. \s
                        위 대화를 바탕으로 사용자의 요구를 분석하고 적절히 응답하세요.
                        사용자가 원하는 한국 드라마, 영화, 예능 촬영지 또는 연예인이 방문한 장소를 정확하고 객관적인 기준으로 추천하세요. \s
                        당신의 목표는 사용자가 원하는 정보를 신뢰할 수 있는 데이터 기반으로 제공하는 것입니다. \s
                        장소 추천 시 다음 정보를 포함하세요:
                        
                        1. 콘텐츠 유형 (드라마 / 영화 / 예능 / 연예인 방문지)
                        2. 촬영된 장면 설명 또는 연예인이 방문한 이유
                        3. 장소의 실제 위치 및 특징
                        4. 해당 장소가 선택된 이유 (배경, 분위기, 유사한 촬영 가능 여부)
                        5. 방문 시 참고할 사항 (운영 시간, 접근성, 예약 필요 여부 등)
                        
                        🚫 불필요한 감정적 표현 없이, 객관적이고 직관적인 답변을 제공하세요.
                        💡 사용자가 특정 기준(예: '방탄소년단 RM이 방문한 장소')을 입력하면 해당 기준을 반영해 추천하세요.
                        
                        ✅ 예제 응답: \s
                        "방탄소년단 RM이 방문한 곳 중 하나는 서울 종로구에 위치한 '서울서점'입니다. \s
                        그는 개인 SNS에 이곳을 방문한 사진을 올렸으며, 조용한 분위기에서 독서를 즐길 수 있는 장소로 유명합니다. \s
                        운영 시간은 오전 10시부터 오후 8시까지이며, 도서 구매뿐만 아니라 커피를 즐길 수 있는 공간도 마련되어 있습니다. \s
                        이 외에도 RM이 방문한 장소로는 삼청동의 '온천집' 등이 있으며, 추가 추천이 필요하시면 알려주세요."
                        </instruction>"""
        );
        return promptBuilder.toString();
    }

    private String generateFChatBotPrompt(List<Map<String, String>> dialogueHistory) {
        StringBuilder promptBuilder = new StringBuilder();
        promptBuilder.append("<dialogue history>\n");
        for (Map<String, String> message : dialogueHistory) {
            promptBuilder.append(message.get("role")).append(": ").append(message.get("content")).append("\n");
        }
        promptBuilder.append(
                """
                        <instruction>
                        당신은 감성적이고 공감하는 AI 챗봇입니다. \s
                        위 대화를 바탕으로 사용자의 요구를 분석하고 적절히 응답하세요.
                        사용자의 취향과 감정을 고려하여, 이미 준비된 큐레이션 목록 중에서 가장 적합한 큐레이션을 추천하세요. \s
                        큐레이션은 드라마, 영화, 예능 촬영지 또는 연예인이 방문한 장소를 특정 주제에 맞게 정리한 모음집입니다. \s
                        
                        큐레이션을 추천할 때, 다음 요소를 반영하세요: \s
                        1. 사용자의 감정과 관심사에 공감하는 멘트 추가 \s
                        2. 추천하는 큐레이션의 테마와 분위기 설명 (힐링, 로맨틱, 감성적, 트렌디 등) \s
                        3. 큐레이션에 포함된 대표적인 장소와 특징 소개 \s
                        4. 사용자가 큐레이션을 선택하면, 추가적인 상세 정보를 안내할 것임을 알림 \s
                        
                        💡 사용자가 특정 키워드(예: 'BTS RM', '힐링 여행', '레트로 감성')를 입력하면, 이에 맞는 큐레이션을 추천하세요. \s
                        
                        ✅ 예제 응답: \s
                        "와! 정말 좋은 선택이에요. 😊 \s
                        방탄소년단 RM이 방문했던 감성적인 공간을 찾고 계신다면, \s
                        🚀 'BTS RM이 사랑한 장소들' 큐레이션을 추천드릴게요! \s
                        이 큐레이션에는 RM이 직접 다녀가며 SNS에 올린 장소들이 포함되어 있어요. \s
                        
                        📍 대표적인 장소: \s
                        - 서울서점 📖 : RM이 조용히 책을 읽으며 사색을 즐겼던 서점 \s
                        - *천집 🍲 : 그가 따뜻한 한식 한 끼를 즐겼던 곳 \s
                        - 남해 바래길 12코스 🌊 : RM이 자연 속에서 힐링을 느꼈던 명소 \s
                        
                        이 외에도 RM의 취향을 반영한 특별한 장소들이 포함되어 있어요. \s
                        이 큐레이션이 마음에 드시면, 더 자세한 정보도 제공해 드릴 수 있어요! 😍" \s
                        </instruction>"""
        );
        return promptBuilder.toString();
    }
}
