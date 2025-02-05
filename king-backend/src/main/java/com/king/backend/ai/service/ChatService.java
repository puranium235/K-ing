package com.king.backend.ai.service;

import com.king.backend.ai.dto.ChatHistory;
import com.king.backend.ai.util.AuthUtil;
import com.king.backend.ai.util.ChatPromptGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

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

        return Map.of("message", gptResponse, "dialogueHistory", dialogueHistory);
    }

    private List<Map<String, String>> convertChatHistoryToDialogueHistory(List<ChatHistory> chatHistoryList) {
        return chatHistoryList.stream()
                .filter(chat -> "message".equals(chat.getType()))
                .map(chat -> Map.of("role", chat.getRole(), "content", chat.getContent()))
                .collect(Collectors.toList());
    }
}
