package com.king.backend.domain.post.controller;

import com.king.backend.domain.post.dto.request.PostUploadRequestDto;
import com.king.backend.domain.post.dto.response.PostAllResponseDto;
import com.king.backend.domain.post.dto.response.PostDetailResponseDto;
import com.king.backend.domain.post.service.PostService;
import com.king.backend.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/post")
@Slf4j
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    @Operation(summary = "게시글 업로드 API")
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<Long>> uploadPost(
            @RequestPart("post") PostUploadRequestDto reqDto,
            @RequestPart(value = "imageFile", required = false) MultipartFile imageFile) {
        Long postId = postService.uploadPost(reqDto, imageFile);
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(postId));
    }

    @Operation(summary = "게시글 전체 목록 조회(피드) API")
    @GetMapping()
    public ResponseEntity<ApiResponse<List<PostAllResponseDto>>> getAllPosts(){
        List<PostAllResponseDto> posts = postService.getAllPosts();
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(posts));
    }

    @Operation(summary = "게시글 상세 조회 API")
    @GetMapping("/{postId}")
    public ResponseEntity<ApiResponse<PostDetailResponseDto>> getPostDetail(@PathVariable Long postId){
        PostDetailResponseDto post = postService.getPostDetail(postId);
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(post));
    }

    @Operation(summary = "게시글 수정 API")
    @PostMapping(value="/{postId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<Long>> updatePost(
            @PathVariable Long postId,
            @RequestPart("post") PostUploadRequestDto reqDto,
            @RequestPart(value = "imageFile", required = false) MultipartFile imageFile) {
        Long updatedPostId = postService.updatePost(postId, reqDto, imageFile);
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(updatedPostId));
    }
}
