package com.king.backend.ai.dto;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String role;

    @Column(nullable = false, updatable = false, columnDefinition = "DATETIME DEFAULT NOW()")
    private OffsetDateTime created;

    @Column(columnDefinition = "TEXT")
    private String content;

    public ChatHistory(Long userId, String user, String userMessage) {
        this.userId = userId;
        this.role = user;
        this.created = OffsetDateTime.now();
        this.content = userMessage;
    }
}
