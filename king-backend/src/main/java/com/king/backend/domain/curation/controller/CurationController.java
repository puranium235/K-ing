package com.king.backend.domain.curation.controller;

import com.king.backend.domain.curation.dto.response.CurationDetailResponseDTO;
import com.king.backend.domain.curation.service.CurationService;
import com.king.backend.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/curation")
@RequiredArgsConstructor
@SecurityRequirement(name = "BearerAuth")
public class CurationController {
    private final CurationService curationService;

    @GetMapping("/{curationListId}")
    public ResponseEntity<ApiResponse<CurationDetailResponseDTO>> getCurationDetail (@PathVariable(value = "curationListId") Long curationListId) {
        CurationDetailResponseDTO curationDetailResponseDTO = curationService.getCurationDetail(curationListId);
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(curationDetailResponseDTO));
    }
}
