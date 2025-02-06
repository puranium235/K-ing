package com.king.backend.search.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 검색 요청 DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SearchRequestDto {
    private String query;
    private String category;

    private String relatedType;

    private int size = 10;

    private String sortBy;
    private String sortOrder;

    private List<String> placeTypeList;
    private String region;

    private String cursor;
}
