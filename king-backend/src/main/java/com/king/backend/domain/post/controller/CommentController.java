package com.king.backend.domain.post.controller;

import com.king.backend.domain.post.dto.request.CommentUploadRequestDto;
import com.king.backend.domain.post.service.CommentService;
import com.king.backend.domain.post.service.PostService;
import com.king.backend.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/post/{postId}/comment")
@Slf4j
@RequiredArgsConstructor
public class CommentController {
    private final PostService postService;
    private final CommentService commentService;

    @Operation(summary = "댓글 생성 API")
    @PostMapping
    public ResponseEntity<ApiResponse<Void>> uploadComent(
            @PathVariable Long postId,
            @RequestBody CommentUploadRequestDto reqDto){
        commentService.uploadComment(postId, reqDto);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).body(ApiResponse.success(null));
    }

    @Operation(summary = "댓글 삭제 API")
    @DeleteMapping("/{commentId}")
    public ResponseEntity<ApiResponse<Void>> deleteComment(@PathVariable Long commentId){
        commentService.deleteComment(commentId);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).body(ApiResponse.success(null));
    }

}
