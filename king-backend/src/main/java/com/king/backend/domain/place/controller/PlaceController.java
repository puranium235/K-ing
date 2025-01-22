package com.king.backend.domain.place.controller;

import com.king.backend.domain.place.errorcode.PlaceErrorCode;
import com.king.backend.global.exception.CustomException;
import com.king.backend.global.response.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/place")
@Slf4j
public class PlaceController {

    // 공통 응답 모듈 테스트
    @GetMapping("/success")
    public ResponseEntity<ApiResponse<String>> getSuccessResponse() {
        log.info("GET /place/success 요청 처리 시작");
        ResponseEntity<ApiResponse<String>> response = ResponseEntity
                .status(HttpStatus.OK)
                .body(ApiResponse.success("장소 조회 성공"));
        log.info("GET /place/success 요청 처리 완료: {}", response.getBody());
        return response;
    }

    @GetMapping("/error")
    public ResponseEntity<ApiResponse<String>> getErrorResponse() {
        log.warn("GET /place/error 요청 처리 중 예외 발생");
        throw new CustomException(PlaceErrorCode.PLACE_NOT_FOUND);
    }

}
