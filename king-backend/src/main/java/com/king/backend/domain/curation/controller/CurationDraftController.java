package com.king.backend.domain.curation.controller;

import com.king.backend.domain.curation.dto.request.CurationPostRequestDTO;
import com.king.backend.domain.curation.service.CurationDraftService;
import com.king.backend.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping
@RequiredArgsConstructor
public class CurationDraftController {
    private final CurationDraftService curationDraftService;

    @Operation(summary = "큐레이션 임시저장")
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<Void>> postCurations(
            @RequestPart(value = "curation") CurationPostRequestDTO requestDTO,
            @RequestPart(value = "imageFile", required = false) MultipartFile imageFile) {
            curationDraftService.saveDraft(requestDTO, imageFile);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(null));
    }
}
