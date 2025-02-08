package com.king.backend.ai.util;

import java.util.List;
import java.util.Map;

public class ChatPromptGenerator {
    public static String generatePrompt(List<Map<String, String>> dialogueHistory) {
        StringBuilder promptBuilder = new StringBuilder();

        promptBuilder.append(
                """
                <instruction>
                다음은 사용자와의 대화 기록입니다. 사용자의 요구사항을 정확하게 분석하여 다음 JSON 형식에 맞게 응답하세요.
                                
                **목표:** \s
                1. 사용자의 대화 내용을 요약합니다. \s
                2. 사용자가 특정 장소 추천이나 큐레이션 추천을 원하면 관련 키워드를 추출합니다. \s
                3. 추천이 필요하지 않은 경우 `isRecommend: false`를 반환합니다. \s
                4. 추천이 필요한 경우 `isRecommend: true`로 설정하고, 장소 및 큐레이션 추천 키워드를 각각 추출합니다. \s
                                
                **JSON 출력 형식:** \s
                ```json
                {
                  "summary": "<사용자의 대화를 간결하게 요약>",
                  "isRecommend": <true 또는 false>,
                  "type": "<CAST, SHOW, MOVIE, DRAMA, CURATION 중 적절한 값>",
                  "keyword": "<추천이 필요하면 키워드, 없으면 빈 문자열>"
                }
                규칙:
                - 기본적으로 대화를 요약하고 isRecommend: false로 설정
                - 사용자가 특정 연예인(배우, 가수, 방송인) 관련 장소를 원하면 "type": "CAST", "keyword": "<연예인 이름>"
                - 사용자가 특정 드라마의 촬영지를 원하면 "type": "DRAMA", "keyword": "<드라마 제목>"
                - 사용자가 특정 영화의 촬영지를 원하면 "type": "MOVIE", "keyword": "<영화 제목>"
                - 사용자가 특정 예능 촬영지를 원하면 "type": "SHOW", "keyword": "<예능 제목>"
                - 사용자가 특정 큐레이션을 원하면 "type": "CURATION", "keyword": "<큐레이션 주제>"
                만약 사용자의 요청이 추천과 관련이 없으면 isRecommend: false로 설정하고 "type", "keyword" 빈 문자열로 유지            
                </instruction>"""
        );
        promptBuilder.append("<dialogue history>\n");
        for (Map<String, String> message : dialogueHistory) {
            promptBuilder.append(message.get("role")).append(": ").append(message.get("content")).append("\n");
        }
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
