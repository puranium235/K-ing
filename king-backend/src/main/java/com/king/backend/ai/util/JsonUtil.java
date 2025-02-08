package com.king.backend.ai.util;

import com.google.gson.Gson;
import com.google.gson.JsonSyntaxException;
import com.king.backend.ai.dto.ChatSummary;

public class JsonUtil {
    private static final Gson gson = new Gson();

    /**
     * JSON이 GptResponse 객체로 변환 가능한지 확인하는 함수
     *
     * @param json 유효성을 검사할 JSON 문자열
     * @return GptResponse 객체 (유효하면 반환, 유효하지 않으면 null 반환)
     */
    public static ChatSummary validateJson(String json) {
        try {
            return gson.fromJson(json, ChatSummary
                    .class);
        } catch (JsonSyntaxException e) {
            System.out.println("JSON이 유효하지 않습니다: " + e.getMessage());
            return null;
        }
    }
}

