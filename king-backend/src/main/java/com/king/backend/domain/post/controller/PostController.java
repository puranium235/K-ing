package com.king.backend.domain.post.controller;

import com.king.backend.domain.post.dto.request.PostHomeRequestDto;
import com.king.backend.domain.post.dto.request.PostFeedRequestDto;
import com.king.backend.domain.post.dto.request.PostUploadRequestDto;
import com.king.backend.domain.post.dto.response.PostDetailResponseDto;
import com.king.backend.domain.post.dto.response.PostFeedResponseDto;
import com.king.backend.domain.post.dto.response.PostHomeResponseDto;
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

    @Operation(summary = "게시글 전체 목록(홈피드) 조회 API (커서 기반 페이징 지원)")
    @GetMapping("/home")
    public ResponseEntity<ApiResponse<PostHomeResponseDto>> getHomePosts(
            @ModelAttribute PostHomeRequestDto reqDto
    ){
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(postService.getHomePostsWithCursor(reqDto)));
    }

    @Operation(summary = "마이페이지 피드 조회 API (커서 기반 페이징 지원)")
    @GetMapping("/feed")
    public ResponseEntity<ApiResponse<PostFeedResponseDto>> getMyPagePosts(
            @ModelAttribute PostFeedRequestDto reqDto
    ){
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(postService.getFeedPostsWithCursor(reqDto)));
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

    @Operation(summary = "게시글 삭제 API")
    @DeleteMapping("/{postId}")
    public ResponseEntity<ApiResponse<Void>> deletePost(@PathVariable Long postId) {
        postService.deletePost(postId);
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(null));
    }
}
