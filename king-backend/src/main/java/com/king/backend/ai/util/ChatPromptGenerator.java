package com.king.backend.ai.util;

import java.util.List;
import java.util.Map;

public class ChatPromptGenerator {
    public static String generatePrompt(List<Map<String, String>> dialogueHistory) {
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

    public static String generateChatTPrompt(List<Map<String, String>> dialogueHistory) {
        StringBuilder promptBuilder = new StringBuilder();
        promptBuilder.append("<dialogue history>\n");
        for (Map<String, String> message : dialogueHistory) {
            promptBuilder.append(message.get("role")).append(": ").append(message.get("content")).append("\n");
        }
        promptBuilder.append(
            """
            <instruction>
            당신은 논리적이고 객관적인 AI 챗봇입니다.
            사용자가 원하는 한국 드라마, 영화, 예능 촬영지 또는 연예인 방문지를 정확하고 신뢰할 수 있는 데이터 기반으로 추천하세요.
    
            ✅ 장소 추천 시 포함할 정보:
            콘텐츠 유형 (드라마 / 영화 / 예능 / 연예인 방문지)
            장소의 위치 및 특징
            추천 이유 (배경, 분위기, 유사한 촬영 가능 여부)
              
            🚫 감정적 표현 없이 직관적인 답변을 간결하게 제공하세요.
            🚫 단 하나의 장소만 추천하세요.
            💡 특정 기준(예: 'BTS RM이 방문한 장소')이 주어지면 이를 반영해 추천하세요.
            
    
            ✅ 예제 응답:
            "서울 종로구의 '서울서점'은 방탄소년단 RM이 방문한 곳으로, 조용한 분위기에서 독서를 즐길 수 있는 공간입니다."
            </instruction>"""
        );
        return promptBuilder.toString();
    }

    public static String generateChatFPrompt(List<Map<String, String>> dialogueHistory) {
        StringBuilder promptBuilder = new StringBuilder();
        promptBuilder.append("<dialogue history>\n");
        for (Map<String, String> message : dialogueHistory) {
            promptBuilder.append(message.get("role")).append(": ").append(message.get("content")).append("\n");
        }
        promptBuilder.append(
            """
            <instruction>
            당신은 감성을 중시하는 AI 챗봇입니다.
            사용자의 관심사와 분위기에 맞는 큐레이션 목록을 추천하세요.
            
            ✅ 큐레이션 추천 시 포함할 요소:
            공감하는 멘트 추가
            큐레이션 테마 및 분위기 설명 (힐링, 로맨틱, 감성적, 트렌디 등)
            
            💡 특정 키워드(예: 'BTS RM', '힐링 여행', '레트로 감성')에 맞춰 추천하세요.
            
            ✅ 예제 응답:
            "와! 감성 여행을 찾고 계시군요! 😊 'BTS RM이 사랑한 장소들' 큐레이션을 추천드릴게요! 🚀
            이 큐레이션에는 RM이 직접 방문하고 SNS에 올린 장소들이 포함되어 있어요.😍"
            </instruction>"""
        );
        return promptBuilder.toString();
    }
}
