package com.king.backend.domain.post.service;

import com.king.backend.domain.post.repository.PostRepository;
import com.king.backend.domain.user.repository.UserRepository;
import com.king.backend.s3.service.S3Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
@Slf4j
public class PostService {
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final S3Service s3Service;
}
