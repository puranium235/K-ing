package com.king.backend.domain.place.controller;

import com.king.backend.domain.place.errorcode.PlaceErrorCode;
import com.king.backend.global.exception.CustomException;
import com.king.backend.global.response.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/place")
public class PlaceController {

    @GetMapping("/success")
    public ResponseEntity<ApiResponse<String>> getSuccessResponse() {
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ApiResponse.success("Place found successfully!"));
    }

    @GetMapping("/error")
    public ResponseEntity<ApiResponse<String>> getErrorResponse() {
        throw new CustomException(PlaceErrorCode.PLACE_NOT_FOUND);
    }

}
