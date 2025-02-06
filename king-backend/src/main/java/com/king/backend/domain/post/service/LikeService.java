package com.king.backend.domain.post.service;

import com.king.backend.domain.post.entity.Like;
import com.king.backend.domain.post.entity.Post;
import com.king.backend.domain.post.errorcode.LikeErrorCode;
import com.king.backend.domain.post.errorcode.PostErrorCode;
import com.king.backend.domain.post.repository.LikeRepository;
import com.king.backend.domain.post.repository.PostRepository;
import com.king.backend.domain.user.dto.domain.OAuth2UserDTO;
import com.king.backend.domain.user.entity.User;
import com.king.backend.domain.user.errorcode.UserErrorCode;
import com.king.backend.domain.user.repository.UserRepository;
import com.king.backend.global.exception.CustomException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class LikeService {

    private final LikeRepository likeRepository;
    private final UserRepository userRepository;
    private final PostRepository postRepository;

    @Transactional
    public void likePost(Long postId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        OAuth2UserDTO oauthUser = (OAuth2UserDTO) authentication.getPrincipal();
        Long userId = Long.parseLong(oauthUser.getName());

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(UserErrorCode.USER_NOT_FOUND));

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new CustomException(PostErrorCode.POST_NOT_FOUND));

        if (likeRepository.existsByPostIdAndUserId(postId, userId)) {
            throw new CustomException(LikeErrorCode.ALREADY_LIKED);
        }

        likeRepository.save(Like.builder()
                .post(post)
                .user(user)
                .build());
    }

    @Transactional
    public void unlikePost(Long postId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        OAuth2UserDTO oauthUser = (OAuth2UserDTO) authentication.getPrincipal();
        Long userId = Long.parseLong(oauthUser.getName());

        Like like = likeRepository.findByPostIdAndUserId(postId, userId)
                .orElseThrow(() -> new CustomException(LikeErrorCode.ALREADY_UNLIKED));

        likeRepository.delete(like);
    }
}
