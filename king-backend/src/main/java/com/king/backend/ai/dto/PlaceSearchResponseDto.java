package com.king.backend.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

// ES 검색 결과 DTO
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlaceSearchResponseDto {
    private List<PlaceResult> places;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PlaceResult {
        private Long placeId;
        private String name;
        private String type; // cafe, playground, restaurant, station, stay, store
        private String address;
        private String description; // 검색어와 자연어처리에 유리한 장소 설명 추가
        private Double lat;
        private Double lng;
        private String imageUrl;
    }
}
