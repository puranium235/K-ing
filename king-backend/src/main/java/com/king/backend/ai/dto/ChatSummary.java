package com.king.backend.ai.dto;


import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Getter
@NoArgsConstructor
@ToString
public class ChatSummary {
    private String summary;
    private boolean isRecommend;
    private String type;
    private String keyword;
}

