package com.king.backend.search.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 검색 요청 DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SearchRequestDto {
    private String query; // 검색 키워드
    private String category; // optional: 특정 카테고리 (CAST, SHOW, MOVIE, DRAMA, PLACE)

    private int page = 0; // 페이지 번호 (기본값 0)
    private int size = 10; // 페이지 당 항목 수 (기본값 10)

    private String sortBy; // 정렬 기준 (예: "name", "popularity", "createdAt")
    private String sortOrder; // 정렬 순서 ("asc" 또는 "desc")

    // 장소 필터링을 위한 추가 필드
    private String placeType; // 장소 유형 필터 (optional)
    private String region; // 지역 필터 (optional)
}
