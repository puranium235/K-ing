package com.king.backend.domain.post.controller;

import com.king.backend.domain.post.service.LikeService;
import com.king.backend.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/post/{postId}/like")
@Slf4j
@RequiredArgsConstructor
public class LikeController {

    private final LikeService likeService;

    @Operation(summary = "게시글 좋아요 등록 API")
    @PostMapping
    public ResponseEntity<ApiResponse<Void>> like(@RequestParam("postId") Long postId) {
        likeService.likePost(postId);
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(null));
    }

    @Operation(summary = "게시글 좋아요 취소 API")
    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> unlikePost(@PathVariable Long postId) {
        likeService.unlikePost(postId);
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(null));
    }
}
