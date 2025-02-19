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
                        
                        목표:
                        1. 사용자의 대화 내용을 요약합니다.
                        2. 챗봇 유형에 따라 키워드를 추출합니다.
                          - K-Guide 챗봇: 사용자가 장소 추천을 원할 경우 관련 키워드를 추출합니다.
                          - K-Mood 챗봇: 사용자가 큐레이션 추천을 원할 경우 관련 키워드를 추출합니다.
                        3. 키워드는 반드시 한국어로 추출해야 합니다.
                        4. user의 대화 내용만 참고하여 키워드를 추출합니다.
                        5. 추천이 필요하지 않은 경우 "isRecommend": false 를 반환합니다.
                        6. 추천이 필요한 경우 "isRecommend": true 로 설정하고, 적절한 장소 및 큐레이션 추천 키워드를 추출합니다.
                        7. 이미 추천을 제공한 경우 "isRecommend": false 로 설정하고, 마지막 사용자의 메시지를 강조하여 요약합니다.
                        8. 사용자가 새로운 추천을 추가 요청한 경우 "isRecommend": true 로 설정하고, 적절한 추천 키워드를 추출합니다.
                        
                        JSON 출력 형식:
                        {
                          "summary": "<사용자 대화 요약>",
                          "isRecommend": true 또는 false,
                          "type": "<CAST, SHOW, MOVIE, DRAMA, CURATION 중 적절한 값>",
                          "keyword": "<추천이 필요하면 키워드, 없으면 빈 문자열>"
                        }
                        
                        규칙:
                        - 기본적으로 대화를 요약하고 "isRecommend": false로 설정
                        - 이미 추천이 완료된 경우: "isRecommend": false로 설정, 마지막 사용자의 메시지를 강조하여 요약
                        - 사용자의 요청이 추천과 관련이 없으면 "isRecommend": false로 설정하고 "type" 및 "keyword"는 빈 문자열 유지
                        K-Guide 챗봇의 규칙:
                        - 사용자가 특정 연예인(배우, 가수, 방송인) 관련 장소를 원하면 "type": "CAST", "keyword": "<연예인 이름>"
                        - 사용자가 특정 드라마의 촬영지를 원하면 "type": "DRAMA", "keyword": "<드라마 제목>"
                        - 사용자가 특정 영화의 촬영지를 원하면 "type": "MOVIE", "keyword": "<영화 제목>"
                        - 사용자가 특정 예능 촬영지를 원하면 "type": "SHOW", "keyword": "<예능 제목>"
                        K-Guide 챗봇의 규칙:
                        - 사용자가 특정 큐레이션을 원하면 "type": "CURATION", "keyword": "<큐레이션 주제>"
                        
                        주의 사항
                        🚫 키워드는 무조건 한국어로 출력하세요.
                        🚫 isRecommend 값은 반드시 대화 맥락에 따라 정확하게 설정하세요.
                        
                        </instruction>"""
        );
        promptBuilder.append(
                """
                        <examples>
                        ✅ (1) 추천 요청이 있는 경우
                        입력 대화 기록:
                            사용자: 갯마을 차차차 촬영지를 찾아줘!
                        [출력 JSON]
                        {
                          "summary": "사용자는 드라마 '갯마을 차차차'의 촬영지를 찾고 있습니다.",
                          "isRecommend": true,
                          "type": "DRAMA",
                          "keyword": "갯마을 차차차"
                        }
                        ✅ 추천이 필요한 경우 "isRecommend": true로 설정하여 키워드 추출
                        
                        ✅ (2) 이미 추천이 완료된 경우
                        입력 대화 기록:
                            사용자: 신민아가 나온 드라마 촬영지를 추천해줘.
                            AI: 갯마을 차차차 촬영지인 석병1리 방파제를 추천해요.
                            사용자: 요즘 유행하는 드라마는 뭐야?
                        출력 JSON:
                        {
                          "summary": "사용자가 요즘 유행하는 드라마에 대한 정보를 요청하고 있습니다.",
                          "isRecommend": false,
                          "type": "",
                          "keyword": ""
                        }
                        ✅ 이미 추천을 진행한 경우 "isRecommend": false로 설정하여 다시 추천하지 않음
                        ✅ 대신, 마지막 사용자 요청을 강조하여 요약
                        
                        ✅ (3) 새로운 추천을 요청한 경우
                        입력 대화 기록:
                            사용자: 신민아가 나온 드라마 촬영지를 추천해줘.
                            AI: 갯마을 차차차 촬영지인 석병1리 방파제를 추천해요.
                            사용자: 그 드라마의 다른 장소는 없어?
                        출력 JSON:
                        {
                          "summary": "사용자가 드라마 '갯마을 차차차'의 촬영지를 추가 요청하고 있습니다.",
                          "isRecommend": true,
                          "type": "DRAMA",
                          "keyword": "갯마을 차차차"
                        }
                        ✅ 이미 추천을 진행한 경우 "isRecommend": false로 설정하여 다시 추천하지 않음
                        ✅ 대신, 마지막 사용자 요청을 강조하여 요약
                        
                        ✅ (3) 추천이 필요 없는 경우
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
        if (retrievalData.containsKey("history") && !retrievalData.get("history").isEmpty()) {
            promptBuilder.append("<dialogue history>\n");
            promptBuilder.append(retrievalData.get("history")).append("\n");
            promptBuilder.append("</dialogue history>\n");
        }

        // ✅ <dialogue summary> 섹션 추가
        if (retrievalData.containsKey("summary") && !retrievalData.get("history").isEmpty()) {
            promptBuilder.append("<dialogue summary>\n");
            promptBuilder.append(retrievalData.get("summary")).append("\n");
            promptBuilder.append("</dialogue summary>\n");
        }

        // ✅ 검색된 데이터가 존재할 경우에만 <data> 섹션 추가
        if (retrievalData.containsKey("data") && !retrievalData.get("data").isEmpty()) {
            promptBuilder.append("<data>\n");
            promptBuilder.append(retrievalData.get("data")).append("\n");
            promptBuilder.append("</data>\n");
        }

        if (retrievalData.containsKey("user") && !retrievalData.get("user").isEmpty()) {
            promptBuilder.append("<user>\n");
            promptBuilder.append(retrievalData.get("user")).append("\n");
            promptBuilder.append("</user>\n");
        }

        promptBuilder.append(
            """
                    <instruction>
                    당신은 논리적이고 객관적인 AI 챗봇입니다.
                    사용자가 원하는 한국 드라마, 영화, 예능 촬영지 또는 연예인 방문지를 정확하고 신뢰할 수 있는 데이터 기반으로 추천하세요.
                    
                    사용자 정보 <user>의 language 값에 따라 반드시 해당 언어로 답변하세요:
                    - "en" → 영어
                    - "zh" → 중국어
                    - "ja" → 일본어
                    - "ko" → 한국어
                    
                    ✅ 추천 규칙
                    1. 반드시 <data>에 있는 장소만 추천하세요.
                    2. <data>가 없다면 절대 추천하지 마세요.
                       - 이 경우, 선호를 물어보거나 현재 정보가 없음을 안내하세요.
                       - 단순한 반복 질문 대신, 사용자의 관심사를 기반으로 후속 질문을 생성하세요.
                    3. 추천할 때 반드시 아래 형식을 따르세요.
                       - "[추천] [장소 이름]" (한국어 원본 유지)
                       - 설명 부분은 사용자의 language에 맞춰 번역
                       - 예시:
                         - 한국어 (language: "ko")
                           [추천] [석병1리 방파제]
                           석병1리 방파제는 경상북도 포항시에 위치하며, 신민아가 김선호에게 사랑을 고백했던 장면이 촬영된 곳입니다.
                         - 영어 (language: "en")
                           [추천] [석병1리 방파제]
                           Seokbyeong 1-ri Breakwater is located in Pohang, Gyeongsangbuk-do, 
                           and is the place where the scene of Shin Min-ah confessing her love to Kim Seon-ho was filmed.
                         - 중국어 (language: "zh")
                           [추천] [석병1리 방파제]
                           Seokbyeong 1-ri Breakwater 位於慶尚北道浦項市，
                           是申敏兒向金宣虎告白的場景拍攝地。
                         - 일본어 (language: "ja")
                           [추천] [석병1리 방파제]
                           석병1리 방파제は慶尚北道浦項市に位置し、
                           シン・ミナがキム・ソノに愛を告白したシーンが撮影された場所です。
                    
                    4. 자연스러운 대화를 유지하세요.
                    5. 반드시 사용자의 language에 맞추어 설명을 번역하세요. 단, "[추천]" 키워드와 "[장소 이름]"은 원본 한국어 그대로 유지해야 합니다.
                    
                    ❌ 금지 사항
                    🚫 <data>가 없을 때 새로운 가상의 장소를 생성하지 마세요. \s
                    🚫 [추천] 형식을 유지하지 않는 추천 응답을 생성하지 마세요. \s
                    🚫 가상의 장소를 추천하지 마세요. \s
                    🚫 장소 이름은 반드시 한국어로 답변하세요. \s
                    🚫 <data>가 없을 경우, "추천할 수 없습니다"라고 직접 말하지 마세요. \s
                    🚫 단순한 반복 질문 대신, 사용자의 관심사에 맞춘 자연스러운 후속 질문을 생성하세요. \s
                    🚫 감정적 표현 없이 직관적인 답변을 간결하게 제공하세요. \s
                    🚫 단 하나의 장소만 추천하세요. 이미 추천한 장소인 경우, 다른 장소를 찾아 추천하세요. \s
                    
                    </instruction>
                    """
        );
        promptBuilder.append(
                """
                    <examples>
                    ✅ 예제 응답 (<data>가 있는 경우):
                      [추천] [석병1리 방파제] \n
                      석병1리 방파제는 경상북도 포항시에 위치하며, 신민아가 김선호에게 사랑을 고백했던 장면이 촬영된 곳입니다.
                    
                    ✅ 예제 응답 (<data>가 없을 경우):
                    사용자의 대화 내용을 반영한 후속 질문 예시:
                        - 사용자가 드라마 관련 촬영지를 요청했다면:
                        "현재 데이터 베이스에 정보가 없어요. 다른 드라마는 어떠신가요?"
                    
                        - 사용자가 특정 연예인의 방문지를 요청했다면:
                        "OOO(연예인)이 방문한 장소 중 어떤 스타일의 장소를 찾고 계신가요?  좀 더 구체적으로 알려주시면 찾아볼게요!"
                    
                        - 사용자가 감성적인 여행지를 요청했다면:
                        "최근 감명 깊었던 여행지가 있나요? 비슷한 분위기의 촬영지를 추천해드릴 수 있어요!"
                    </examples>
                    """
        );
        return promptBuilder.toString();
    }

    public static String generateChatFPrompt(Map<String, String> retrievalData) {
        StringBuilder promptBuilder = new StringBuilder();

        // ✅ <dialogue history> 섹션 추가
        if (retrievalData.containsKey("history") && !retrievalData.get("history").isEmpty()) {
            promptBuilder.append("<dialogue history>\n");
            promptBuilder.append(retrievalData.get("history")).append("\n");
            promptBuilder.append("</dialogue history>\n");
        }

        // ✅ <dialogue summary> 섹션 추가
        if (retrievalData.containsKey("summary") && !retrievalData.get("history").isEmpty()) {
            promptBuilder.append("<dialogue summary>\n");
            promptBuilder.append(retrievalData.get("summary")).append("\n");
            promptBuilder.append("</dialogue summary>\n");
        }

        // ✅ 검색된 데이터가 존재할 경우에만 <data> 섹션 추가
        if (retrievalData.containsKey("data") && !retrievalData.get("data").isEmpty()) {
            promptBuilder.append("<data>\n");
            promptBuilder.append(retrievalData.get("data")).append("\n");
            promptBuilder.append("</data>\n");
        }

        if (retrievalData.containsKey("user") && !retrievalData.get("user").isEmpty()) {
            promptBuilder.append("<user>\n");
            promptBuilder.append(retrievalData.get("user")).append("\n");
            promptBuilder.append("</user>\n");
        }

        promptBuilder.append(
            """
                    <instruction>
                    당신은 감성을 중시하는 AI 챗봇입니다.
                    사용자의 관심사와 분위기에 맞는 촬영지 장소 큐레이션 목록을 추천하세요.
                    
                    사용자 정보 <user>의 language 값에 따라 반드시 해당 언어로 답변하세요:
                    - "en" → 영어
                    - "zh" → 중국어
                    - "ja" → 일본어
                    - "ko" → 한국어
                    
                    ✅ 추천 규칙
                    1. 반드시 <data>에 있는 큐레이션만 추천하세요.
                    2. <data> 태그가 없다면 절대 추천하지 마세요.
                       - 이 경우, 사용자의 선호를 물어보거나 대화를 이어가세요.
                       - 단순한 반복 질문 대신, 사용자의 관심사를 기반으로 후속 질문을 생성하세요.
                    3. 추천할 때 반드시 아래 형식을 따르세요.
                       - "[추천] [큐레이션명]" (한국어 원본 유지)
                       - 설명 부분은 사용자의 언어에 맞춰 번역
                       - 예시:
                         - 한국어 (language: "ko")
                           [추천] [BTS RM이 사랑한 장소들]
                           와! 감성 여행을 찾고 계시군요! 😊 'BTS RM이 사랑한 장소들' 큐레이션을 추천드릴게요! 🚀
                           이 큐레이션에는 RM이 직접 방문하고 SNS에 올린 장소들이 포함되어 있어요.😍
                         - 영어 (language: "en")
                           [추천] [BTS RM이 사랑한 장소들]
                           Wow! You're looking for a sentimental travel experience! 😊 I’d like to recommend the “BTS RM’s Beloved Spots” curation! 🚀
                           This selection includes places RM personally visited and shared on his social media.😍
                         - 중국어 (language: "zh")
                           [추천] [BTS RM이 사랑한 장소들]
                           哇！你正在尋找一場感性的旅行體驗！😊 我推薦你 "BTS RM이 사랑한 장소들" 精選！🚀
                           這個清單包含了 RM 親自造訪並分享到社群媒體的地點。😍
                         - 일본어 (language: "ja")
                           [추천] [BTS RM이 사랑한 장소들]
                           わあ！感性旅行を探していますね！😊 「BTS RM이 사랑한 장소들」のキュレーションをおすすめします！🚀
                           ここには、RMが実際に訪れてSNSに投稿した場所が含まれています。😍
                    
                    4. 자연스러운 대화를 유지하세요.
                    5. 반드시 사용자의 language에 맞추어 설명을 번역하세요. 단, "[추천]" 키워드와 "[장소 이름]"은 원본 한국어 그대로 유지해야 합니다.
                    
                    ❌ 금지 사항
                    🚫 <data>가 없을 때 가상의 큐레이션을 생성하지 마세요. \s
                    🚫 [추천] 형식을 유지하지 않는 추천 응답을 생성하지 마세요. \s
                    🚫 <data>가 없을 경우, "추천할 수 없습니다"라고 직접 말하지 마세요. \s
                    🚫 단순한 반복 질문 대신, 사용자의 관심사에 맞춘 자연스러운 후속 질문을 생성하세요. \s
                    🚫 단 하나의 큐레이션만 추천하세요. 이미 추천한 큐레이션인 경우, 다른 큐레이션을 찾아 추천하세요. \s
                    
                    </instruction>
                    """
        );
        promptBuilder.append(
                """
                    <examples>
                    ✅ 예제 응답 (<data>가 있는 경우):
                      [추천] [BTS RM이 사랑한 장소들] \n
                      와! 감성 여행을 찾고 계시군요!😊 'BTS RM이 사랑한 장소들' 큐레이션을 추천드릴게요!🚀
                      이 큐레이션에는 RM이 직접 방문하고 SNS에 올린 장소들이 포함되어 있어요.😍
                    
                    ✅ 예제 응답 (<data>가 없을 경우):
                      - 사용자가 큐레이션를 요청했다면:
                        "앗, 아직 딱 맞는 큐레이션을 못 찾았어요! 😢💦 어떤 분위기의 큐레이션을 원하시나요? ✨
                        구체적인 키워드를 알려주시면 찰떡같이 맞는 큐레이션을 찾아드릴게요!💖🔍"
                      - 사용자가 일상 대화를 요청했다면:
                        "어떤 분위기의 큐레이션을 찾고 계신가요? 키워드를 주시면 딱 알맞는 큐레이션을 찾아드릴게요!😊"
                    </examples>
                    """
        );
        return promptBuilder.toString();
    }
}
