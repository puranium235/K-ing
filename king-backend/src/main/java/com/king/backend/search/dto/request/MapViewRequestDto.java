package com.king.backend.search.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 지도 보기 요청 DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MapViewRequestDto {
    private String query;
    private String region;
}
