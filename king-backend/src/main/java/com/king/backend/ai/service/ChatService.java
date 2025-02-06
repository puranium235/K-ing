package com.king.backend.ai.service;

import com.king.backend.ai.dto.ChatHistory;
import com.king.backend.ai.util.AuthUtil;
import com.king.backend.ai.util.ChatPromptGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatService {
    private final ChatHistoryService chatHistoryService;
    private final OpenAiChatModel chatModel;

    public List<ChatHistory> getChatHistory() {
        return chatHistoryService.findByUserId(AuthUtil.getUserId());
    }

    public void deleteChatHistory() {
        chatHistoryService.deleteByUserId(AuthUtil.getUserId());
    }

    public void saveChatHistory(ChatHistory chatHistory) {
        chatHistoryService.saveChatHistory(AuthUtil.getUserId(), chatHistory.getRole(), chatHistory.getContent(), chatHistory.getType());
    }

    public Map<String, Object> chatT(String userMessage) {
        return chat(userMessage, ChatPromptGenerator::generateChatTPrompt);
    }

    public Map<String, Object> chatF(String userMessage) {
        return chat(userMessage, ChatPromptGenerator::generateChatFPrompt);
    }

    public Map<String, Object> chat(String userMessage, java.util.function.Function<List<Map<String, String>>, String> promptGenerator) {
        List<ChatHistory> chatHistoryList = chatHistoryService.findByUserId(AuthUtil.getUserId());
        List<Map<String, String>> dialogueHistory = convertChatHistoryToDialogueHistory(chatHistoryList);

        chatHistoryService.saveChatHistory(AuthUtil.getUserId(), "user", userMessage, "message");
        dialogueHistory.add(Map.of("role", "user", "content", userMessage));

        String prompt = promptGenerator.apply(dialogueHistory);
        ChatResponse chatResponse = chatModel.call(new Prompt(new UserMessage(prompt),
                OpenAiChatOptions.builder().model("gpt-4o-mini").temperature(0.7).build()));

        String gptResponse = chatResponse.getResults().get(0).getOutput().getText();
        chatHistoryService.saveChatHistory(AuthUtil.getUserId(), "assistant", gptResponse, "message");

        return Map.of("message", gptResponse);
    }

    // 🎯 논리적 챗봇 스트리밍 응답 (Chat T)
    public Flux<String> streamChatT(String userMessage) {
        return streamChat(userMessage, ChatPromptGenerator::generateChatTPrompt);
    }

    // 🎯 감성적 챗봇 스트리밍 응답 (Chat F)
    public Flux<String> streamChatF(String userMessage) {
        return streamChat(userMessage, ChatPromptGenerator::generateChatFPrompt);
    }

    // 🔹 OpenAI API 스트리밍 방식 호출
    public Flux<String> streamChat(String userMessage, Function<List<Map<String, String>>, String> promptGenerator) {
        SecurityContext securityContext = SecurityContextHolder.getContext();

        List<ChatHistory> chatHistoryList = chatHistoryService.findByUserId(AuthUtil.getUserId());
        List<Map<String, String>> dialogueHistory = convertChatHistoryToDialogueHistory(chatHistoryList);

        // 🔹 사용자 메시지 저장
        chatHistoryService.saveChatHistory(AuthUtil.getUserId(), "user", userMessage, "message");
        dialogueHistory.add(Map.of("role", "user", "content", userMessage));

        // 🔹 OpenAI 프롬프트 생성
        String prompt = promptGenerator.apply(dialogueHistory);
        log.info("prompt: {}", prompt);

        StringBuilder responseBuffer = new StringBuilder();

        // 🔹 OpenAI 스트리밍 호출 (Flux<String> 반환)
        Flux<String> responseStream = chatModel.stream(new Prompt(new UserMessage(prompt),
                        OpenAiChatOptions.builder()
                                .model("gpt-4o-mini")
                                .temperature(0.7)
                                .streamUsage(true)  // 🚀 스트리밍 활성화
                                .build()))
                .map(chatResult -> {
                    SecurityContextHolder.setContext(securityContext); // 🔥 SecurityContext 복원
                    String text = chatResult.getResult().getOutput().getText();
                    log.info("📝 AI Response: {}", text);
                    return text;
                })
                .filter(Objects::nonNull) // ✅ null 데이터 제거

                .doOnNext(chunk -> {
                    SecurityContextHolder.setContext(securityContext);
                    responseBuffer.append(chunk); // 🔹 전체 응답을 누적
                    log.info("🔍 SecurityContext: {}", SecurityContextHolder.getContext().getAuthentication());
                })

                .doOnComplete(() -> {
                    // 🔹 스트리밍이 완료된 후, 최종 응답을 saveChatHistory에 저장
                    SecurityContextHolder.setContext(securityContext);
                    chatHistoryService.saveChatHistory(AuthUtil.getUserId(), "assistant", responseBuffer.toString(), "message");
                    log.info("✅ Streaming Complete - Chat History Saved");
                })

                .onErrorResume(e -> {
                    log.error("❌ Streaming Error: {}", e.getMessage(), e);
                    return Flux.just("Error occurred during streaming: " + e.getMessage());
                });

        return responseStream;
    }

    private List<Map<String, String>> convertChatHistoryToDialogueHistory(List<ChatHistory> chatHistoryList) {
        return chatHistoryList.stream()
                .filter(chat -> "message".equals(chat.getType()))
                .map(chat -> Map.of("role", chat.getRole(), "content", chat.getContent()))
                .collect(Collectors.toList());
    }
}
