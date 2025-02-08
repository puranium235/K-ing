package com.king.backend.search.controller;

import com.king.backend.domain.content.dto.response.ContentDetailResponseDto;
import com.king.backend.global.response.ApiResponse;
import com.king.backend.search.dto.request.AutocompleteRequestDto;
import com.king.backend.search.dto.request.MapViewRequestDto;
import com.king.backend.search.dto.request.SearchRequestDto;
import com.king.backend.search.dto.response.AutocompleteResponseDto;
import com.king.backend.search.dto.response.MapViewResponseDto;
import com.king.backend.search.dto.response.SearchResponseDto;
import com.king.backend.search.service.SearchService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/search")
public class SearchController {

    private final SearchService searchService;

    /**
     * 자동완성 API
     * @param requestDto 자동완성 요청 DTO
     * @return 자동완성 결과
     */
    @GetMapping("/autocomplete")
    public ResponseEntity<ApiResponse<AutocompleteResponseDto>> autocomplete(@ModelAttribute AutocompleteRequestDto requestDto) {
        AutocompleteResponseDto response = searchService.getAutocompleteSuggestions(requestDto);
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(response));
    }

    /**
     * 검색 API
     * @param requestDto 검색 요청 DTO
     * @return 검색 결과
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<SearchResponseDto>> search(@ModelAttribute SearchRequestDto requestDto) {
        SearchResponseDto response = searchService.search(requestDto);
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(response));
    }

    /**
     * 지도 보기 API
     * @param requestDto 지도 보기를 위한 필터 요청 DTO
     * @return 지도에 표시할 장소 목록과 적용된 필터
     */
    @GetMapping("/map-view")
    public ResponseEntity<ApiResponse<MapViewResponseDto>> mapView(@ModelAttribute MapViewRequestDto requestDto) {
        MapViewResponseDto response = searchService.getMapViewPlaces(requestDto);
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(response));
    }
}
