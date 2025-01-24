package com.king.backend.domain.place.controller;

import com.king.backend.domain.place.dto.response.PlaceDetailResponseDto;
import com.king.backend.domain.place.errorcode.PlaceErrorCode;
import com.king.backend.domain.place.service.PlaceService;
import com.king.backend.global.exception.CustomException;
import com.king.backend.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/place")
@Slf4j
@RequiredArgsConstructor
public class PlaceController {

    private final PlaceService placeService;

    // 공통 응답 모듈 테스트
    @GetMapping("/success")
    public ResponseEntity<ApiResponse<String>> getSuccessResponse() {
        log.info("GET /api/place/success 요청 처리 시작");
        ResponseEntity<ApiResponse<String>> response = ResponseEntity
                .status(HttpStatus.OK)
                .body(ApiResponse.success("장소 조회 성공 반환 data"));
        log.info("GET /api/place/success 요청 처리 완료: {}", response.getBody());
        return response;
    }

    @GetMapping("/error")
    public ResponseEntity<ApiResponse<String>> getErrorResponse() {
        // 예외 처리 로그 필요 X (GlobalExceptionHandler에서 에러코드, 메세지 로그 출력됨)
        throw new CustomException(PlaceErrorCode.PLACE_NOT_FOUND);
    }

    // 장소 상세 정보 조회
    @GetMapping("/{placeId}")
    public ResponseEntity<ApiResponse<PlaceDetailResponseDto>> getPlaceDetail(@PathVariable Long placeId){
        log.info("GET /api/place/{} 요청 처리 시작", placeId);
        PlaceDetailResponseDto dto = placeService.getPlaceDetail(placeId);
//        log.info("***************GET /api/place/{} 요청 처리 dto : {}************", placeId, dto);
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(dto));
    }


}
