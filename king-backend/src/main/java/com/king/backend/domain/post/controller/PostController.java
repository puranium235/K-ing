package com.king.backend.domain.post.controller;

import com.king.backend.domain.post.dto.request.PostUploadRequestDto;
import com.king.backend.domain.post.service.PostService;
import com.king.backend.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/post")
@Slf4j
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<Long>> uploadPost(
            @RequestPart("post") PostUploadRequestDto reqDto,
            @RequestPart(value = "imageFile", required = false) MultipartFile imageFile) {
        Long postId = postService.uploadPost(reqDto, imageFile);
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(postId));
    }
}
