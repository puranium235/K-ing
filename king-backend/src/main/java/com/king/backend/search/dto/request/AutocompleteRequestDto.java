package com.king.backend.search.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 자동완성 요청 DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AutocompleteRequestDto {
    private String query; // 사용자가 입력한 키워드
    private String category; // 특정 카테고리 필터링 시 (CAST, SHOW, MOVIE, DRAMA, PLACE)
}
