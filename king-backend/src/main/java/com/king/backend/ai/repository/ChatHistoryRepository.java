package com.king.backend.ai.repository;

import com.king.backend.ai.dto.ChatHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatHistoryRepository extends JpaRepository<ChatHistory, Long> {
    List<ChatHistory> findByUserId(Long userId);
    void deleteByUserId(Long userId);
}
