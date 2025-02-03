package com.king.backend.ai.controller;

import com.king.backend.ai.dto.ChatHistory;
import com.king.backend.ai.repository.ChatHistoryRepository;
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
@RequestMapping("/ai")
public class AIController {

    private final ChatHistoryRepository chatHistoryRepository;
    private final OpenAiChatModel chatModel;

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
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            Long userId = Long.parseLong(authentication.getName());

            String userMessage = requestBody.get("userMessage");

            // DB에서 대화 히스토리 가져오기
            List<ChatHistory> chatHistoryList = chatHistoryRepository.findByUserId(userId);
            List<Map<String, String>> dialogueHistory = convertChatHistoryToDialogueHistory(chatHistoryList);

            // 사용자 메시지 저장
            if (userMessage != null && !userMessage.trim().isEmpty()) {
                chatHistoryRepository.save(new ChatHistory(userId, "user", userMessage));

                Map<String, String> userMessageMap = Map.of("role", "user", "content", userMessage);
                dialogueHistory.add(userMessageMap);

                // GPT 프롬프트 생성 및 호출
                String prompt = generatePrompt(dialogueHistory);
                // GPT 응답 생성
                ChatResponse chatResponse = chatModel.call(
                        new Prompt(new UserMessage(prompt),
                                OpenAiChatOptions.builder()
                                        .model("gpt-4o-mini")
                                        .temperature(0.7)
                                        .build()
                        )
                );

                String gptResponse = chatResponse.getResults().get(0).getOutput().getText();

                // GPT 응답 저장
                chatHistoryRepository.save(new ChatHistory(userId, "assistant", gptResponse));

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
                        위 대화를 바탕으로 사용자의 요구를 분석하고 적절히 응답하세요.
                           - 사용자가 촬영지 장소 추천을 요청하는 경우 이를 바탕으로 적절한 장소를 추천하세요.
                           - 장소 추천은 다음 형식으로 응답하세요: "추천 장소: [장소 이름]. [이 장소를 추천한 이유.]"
                           - 사용자의 요청이 모호하면 현재 대화를 바탕으로 추가로 물어볼 질문을 생성하세요.
                        
                        응답을 작성할 때 다음 규칙을 따르세요:
                         1. 가독성을 위해 적절한 html 태그를 사용하세요.
                         2. 줄바꿈으로 비어있는 문장을 사용하지 마세요.
                         3. 응답은 자연스럽고 친근하게 작성하며, 불필요한 공백 없이 간결하게 표현하세요.
                        </instruction>"""
        );
        return promptBuilder.toString();
    }
}
