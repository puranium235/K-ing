package com.king.backend.ai.util;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.king.backend.ai.dto.RagSearchResponseDto;

import java.util.List;
import java.util.stream.Collectors;

public class SearchResultFormatter {
    private static final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * ES 검색 결과를 AI 프롬프트용 JSON 포맷으로 변환
     * - `placeId`, `lat`, `lng`, `imageUrl` 필드 제외
     */
    public static String formatSearchResultsForAI(RagSearchResponseDto searchResults) {
        if (searchResults == null || searchResults.getPlaces() == null || searchResults.getPlaces().isEmpty()) {
            return "[]"; // 추천할 장소가 없으면 빈 배열 반환
        }

        try {
            // 필요한 필드만 포함하여 변환
            List<SimplifiedPlace> simplifiedPlaces = searchResults.getPlaces().stream()
                    .map(place -> new SimplifiedPlace(place.getName(), place.getType(), place.getAddress(), place.getDescription()))
                    .collect(Collectors.toList());

            return objectMapper.writeValueAsString(simplifiedPlaces);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("JSON 변환 중 오류 발생", e);
        }
    }

    /**
     * AI 추천을 위한 최소한의 필드만 포함하는 DTO
     */
    private static class SimplifiedPlace {
        public String name;
        public String type;
        public String address;
        public String description;

        public SimplifiedPlace(String name, String type, String address, String description) {
            this.name = name;
            this.type = type;
            this.address = address;
            this.description = description;
        }
    }

    public static void printSearchResults(RagSearchResponseDto searchResults) {
        if (searchResults != null && searchResults.getPlaces() != null && !searchResults.getPlaces().isEmpty()) {
            System.out.print("🔍 검색된 장소 목록:");
            System.out.println(searchResults.getPlaces().size());
            for (RagSearchResponseDto.PlaceResult place : searchResults.getPlaces()) {
                System.out.println("📍 장소 ID: " + place.getPlaceId());
                System.out.println("   이름: " + place.getName());
                System.out.println("   유형: " + place.getType());
                System.out.println("   주소: " + place.getAddress());
                System.out.println("   설명: " + place.getDescription());
                System.out.println("   위치: (" + place.getLat() + ", " + place.getLng() + ")");
                System.out.println("   이미지: " + place.getImageUrl());
                System.out.println("---------------------------------");
            }
        } else {
            System.out.println("❌ 검색된 장소가 없습니다.");
        }
    }
}
