package com.king.backend.ai.service;

import com.king.backend.ai.dto.ChatHistory;
import com.king.backend.ai.repository.ChatHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatHistoryService {
    private final ChatHistoryRepository chatHistoryRepository;

    public List<ChatHistory> findByUserId(Long userId) {
        return chatHistoryRepository.findByUserId(userId);
    }

    public void deleteByUserId(Long userId) {
        chatHistoryRepository.deleteByUserId(userId);
    }

    public void saveChatHistory(ChatHistory chatHistory) {
        chatHistoryRepository.save(chatHistory);
    }
}


