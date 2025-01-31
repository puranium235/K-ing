package com.king.backend.domain.post.controller;

import com.king.backend.domain.post.dto.request.PostUploadRequestDto;
import com.king.backend.domain.post.dto.response.PostUploadResponseDto;
import com.king.backend.domain.post.service.PostService;
import com.king.backend.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/post")
@Slf4j
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    // 게시글 업로드
    @PostMapping
    public ResponseEntity<ApiResponse<PostUploadResponseDto>> uploadPost(
            @RequestPart("post") PostUploadRequestDto reqDto,
            @RequestPart(value = "images", required = false) List<MultipartFile> images) {

        PostUploadResponseDto resDto = postService.createPost(reqDto, images);
        return ResponseEntity.ok(ApiResponse.success(resDto));
    }


}
