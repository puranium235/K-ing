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
                                        
                        목표: \s
                        1. 사용자의 대화 내용을 요약합니다. \s
                        2. 사용자가 특정 장소 추천이나 큐레이션 추천을 원하면 관련 키워드를 추출합니다. \s
                        3. 추천이 필요하지 않은 경우 "isRecommend": false 를 반환합니다. \s
                        4. 추천이 필요한 경우 "isRecommend": true 로 설정하고, 장소 및 큐레이션 추천 키워드를 각각 추출합니다. \s
                        5. 이미 추천을 진행한 경우 "isRecommend": false로 설정하고, 마지막 사용자의 메시지를 강조하여 요약합니다.
                                        
                        JSON 출력 형식: \s
                        {
                          "summary": "<사용자의 대화를 간결하게 요약>",
                          "isRecommend": "<true 또는 false>",
                          "type": "<CAST, SHOW, MOVIE, DRAMA, CURATION 중 적절한 값>",
                          "keyword": "<추천이 필요하면 키워드, 없으면 빈 문자열>"
                        }
                        
                        규칙:
                        - 기본적으로 대화를 요약하고 "isRecommend": false로 설정
                        - 사용자가 특정 연예인(배우, 가수, 방송인) 관련 장소를 원하면 "type": "CAST", "keyword": "<연예인 이름>"
                        - 사용자가 특정 드라마의 촬영지를 원하면 "type": "DRAMA", "keyword": "<드라마 제목>"
                        - 사용자가 특정 영화의 촬영지를 원하면 "type": "MOVIE", "keyword": "<영화 제목>"
                        - 사용자가 특정 예능 촬영지를 원하면 "type": "SHOW", "keyword": "<예능 제목>"
                        - 사용자가 특정 큐레이션을 원하면 "type": "CURATION", "keyword": "<큐레이션 주제>"
                        - 이미 추천이 완료된 경우: "isRecommend": false로 설정, 마지막 사용자의 메시지를 강조하여 요약
                        - 사용자의 요청이 추천과 관련이 없으면 "isRecommend": false로 설정하고 "type" 및 "keyword"는 빈 문자열 유지           
                        </instruction>"""
        );
        promptBuilder.append(
                """
                        <examples>
                        ✅ (1) 추천 요청이 있는 경우
                        입력 대화 기록:
                            사용자: 신민아가 나온 드라마 촬영지를 추천해줘.
                        [출력 JSON]
                        {
                          "summary": "사용자는 신민아가 출연한 드라마 촬영지를 찾고 있습니다.",
                          "isRecommend": true,
                          "type": "CAST",
                          "keyword": "신민아"
                        }
                        ✅ 추천이 필요한 경우 "isRecommend": true로 설정하여 키워드 추출
                                                
                        ✅ (2) 이미 추천이 완료된 경우
                        입력 대화 기록:
                            사용자: 신민아가 나온 드라마 촬영지를 추천해줘.
                            AI: 갯마을 차차차 촬영지인 석병1리 방파제를 추천해요.
                            사용자: 아, 그렇군요! 다른 추천은 없어?
                        출력 JSON:
                        {
                          "summary": "사용자는 추가 추천을 요청했지만, 이미 추천이 완료되었으므로 마지막 요청을 강조하여 요약합니다.",
                          "isRecommend": false,
                          "type": "",
                          "keyword": ""
                        }
                        ✅ 이미 추천을 진행한 경우 "isRecommend": false로 설정하여 다시 추천하지 않음
                        ✅ 대신, 마지막 사용자 요청을 강조하여 요약
                                                
                        ✅ (3) 일상 대화인 경우
                        입력 대화 기록:
                            사용자: 오늘 날씨가 좋네요.
                        출력 JSON:
                        {
                          "summary": "사용자는 날씨가 좋다고 이야기했습니다.",
                          "isRecommend": false,
                          "type": "",
                          "keyword": ""
                        }
                        ✅ 추천이 필요하지 않으므로 "isRecommend": false로 설정
                        </examples>
                        """
        );
        promptBuilder.append("<dialogue history>\n");
        for (Map<String, String> message : dialogueHistory) {
            promptBuilder.append(message.get("role")).append(": ").append(message.get("content")).append("\n");
        }
        return promptBuilder.toString();
    }

    public static String generateChatTPrompt(Map<String, String> retrievalData) {
        StringBuilder promptBuilder = new StringBuilder();

        // ✅ <dialogue history> 섹션 추가
        promptBuilder.append("<dialogue history>\n");
        promptBuilder.append(retrievalData.get("history")).append("\n");

        // ✅ <dialogue summary> 섹션 추가
        promptBuilder.append("<dialogue summary>\n");
        promptBuilder.append(retrievalData.get("summary")).append("\n");

        // ✅ 검색된 데이터가 존재할 경우에만 <data> 섹션 추가
        if (retrievalData.containsKey("data") && !retrievalData.get("data").isEmpty()) {
            promptBuilder.append("<data>\n");
            promptBuilder.append(retrievalData.get("data")).append("\n");
        }

        promptBuilder.append(
            """
                    <instruction>
                    당신은 논리적이고 객관적인 AI 챗봇입니다.
                    사용자가 원하는 한국 드라마, 영화, 예능 촬영지 또는 연예인 방문지를 정확하고 신뢰할 수 있는 데이터 기반으로 추천하세요.
                    
                    ✅ 추천 규칙
                    1. 반드시 <data>에 있는 장소만 추천하세요.
                    2. <data>가 없다면 절대 추천하지 마세요.
                        - 이 경우, 사용자의 선호를 물어보거나 대화를 이어가세요.
                    3. 추천할 때 반드시 다음 정보를 포함하세요.
                        - 장소의 위치 및 특징
                        - 추천 이유 (배경, 특정 장면 설명)
                                        
                    ❌ 금지 사항
                    🚫 <data>가 없을 때 새로운 장소를 생성하지 마세요.
                    🚫 가상의 장소를 추천하지 마세요.
                    🚫 <data>가 없을 경우, "추천할 수 없습니다"라고 직접 말하지 마세요.
                    🚫 대신, 사용자의 선호를 물어보거나 대화를 유도하세요.
                    🚫 감정적 표현 없이 직관적인 답변을 간결하게 제공하세요. \s
                    🚫 단 하나의 장소만 추천하세요. \s
                    💡 특정 기준(예: '갯마을 차차차에 나온 장소')이 주어지면 이를 반영해 추천하세요. \s
                    
                    ✅ 예제 응답 (추천 가능한 경우)
                      [장소] 석병1리 방파제
                      석병1리 방파제는 경상북도 포항시에 위치하며, 신민아가 김선호에게 사랑을 고백했던 장면이 촬영된 곳입니다.
                      
                    ✅ 예제 응답 (<data>가 없을 경우)
                      "갯마을 차차차에서 어떤 분위기의 장소를 찾고 계신가요? 특별히 기억에 남는 장면이 있나요?"
                      
                    </instruction>"""
        );
        return promptBuilder.toString();
    }

    public static String generateChatFPrompt(Map<String, String> retrievalData) {
        StringBuilder promptBuilder = new StringBuilder();

        // ✅ <dialogue> 섹션 추가
        promptBuilder.append("<dialogue summary>\n");
        promptBuilder.append(retrievalData.get("summary")).append("\n");

        // ✅ 검색된 데이터가 존재할 경우에만 <data> 섹션 추가
        if (retrievalData.containsKey("data") && !retrievalData.get("data").isEmpty()) {
            promptBuilder.append("<data>\n");
            promptBuilder.append(retrievalData.get("data")).append("\n");
        }

        promptBuilder.append(
            """
                    <instruction>
                    당신은 감성을 중시하는 AI 챗봇입니다.
                    사용자의 관심사와 분위기에 맞는 촬영지 장소 큐레이션 목록을 추천하세요.
                    
                    - 반드시 주어진 <data>에 있는 큐레이션만 추천하세요.\s
                    - 추천할 데이터가 없을 때 자연스럽게 사용자의 선호도를 물어보세요.
                        ✅ "추천할 정보가 없습니다"라고 말하지 않고 대화 흐름을 유지 \s
                    - 큐레이션 추천 시 다음 정보를 포함하세요.
                        - 공감하는 멘트 추가
                        - 큐레이션 테마 및 분위기 설명 (힐링, 로맨틱, 감성적, 트렌디 등)
                    
                    💡 특정 키워드(예: 'BTS RM', '힐링 여행', '레트로 감성')에 맞춰 추천하세요.
                    
                    ✅ 예제 응답:
                    "와! 감성 여행을 찾고 계시군요! 😊 'BTS RM이 사랑한 장소들' 큐레이션을 추천드릴게요! 🚀
                    이 큐레이션에는 RM이 직접 방문하고 SNS에 올린 장소들이 포함되어 있어요.😍"
                    </instruction>"""
        );
        return promptBuilder.toString();
    }
}
