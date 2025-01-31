package com.king.backend.domain.post.service;

import com.king.backend.domain.post.dto.request.PostUploadRequestDto;
import com.king.backend.domain.post.dto.response.PostUploadResponseDto;
import com.king.backend.domain.post.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;


@Service
@RequiredArgsConstructor
@Slf4j
public class PostService {
    private final PostRepository postRepository;

    public PostUploadResponseDto createPost(PostUploadRequestDto reqDto, List<MultipartFile> images) {
        return new PostUploadResponseDto();
    }
}
