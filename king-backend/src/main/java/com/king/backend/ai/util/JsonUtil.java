package com.king.backend.ai.util;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.king.backend.ai.dto.ChatSummary;

public class JsonUtil {
    private static final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * JSON이 ChatSummary 객체로 변환 가능한지 확인하는 함수
     *
     * @param json 유효성을 검사할 JSON 문자열
     * @return ChatSummary 객체 (유효하면 반환, 유효하지 않으면 null 반환)
     */
    public static ChatSummary validateJson(String json) {
        try {
            return objectMapper.readValue(json, ChatSummary.class);
        } catch (JsonProcessingException e) {
            System.out.println("JSON이 유효하지 않습니다: " + e.getMessage());
            return null;
        }
    }
}


