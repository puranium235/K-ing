package com.king.backend.domain.post.service;

import com.king.backend.domain.post.dto.request.CommentUploadRequestDto;
import com.king.backend.domain.post.dto.response.CommentAllResponseDto;
import com.king.backend.domain.post.entity.Comment;
import com.king.backend.domain.post.entity.Post;
import com.king.backend.domain.post.errorcode.CommentErrorCode;
import com.king.backend.domain.post.errorcode.PostErrorCode;
import com.king.backend.domain.post.repository.CommentRepository;
import com.king.backend.domain.post.repository.LikeRepository;
import com.king.backend.domain.post.repository.PostRepository;
import com.king.backend.domain.user.dto.domain.OAuth2UserDTO;
import com.king.backend.domain.user.entity.User;
import com.king.backend.domain.user.errorcode.UserErrorCode;
import com.king.backend.domain.user.repository.UserRepository;
import com.king.backend.global.exception.CustomException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class CommentService {
    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final LikeRepository likeRepository;

    @Transactional
    public void uploadComment(Long postId, CommentUploadRequestDto reqDto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        OAuth2UserDTO oauthUser = (OAuth2UserDTO) authentication.getPrincipal();
        Long userId = Long.parseLong(oauthUser.getName());
        User writer = userRepository.findById(userId).orElseThrow(() -> new CustomException(UserErrorCode.USER_NOT_FOUND));

        Post post = postRepository.findById(postId).orElseThrow(() -> new CustomException(PostErrorCode.POST_NOT_FOUND));

        Comment comment = Comment.builder()
                .content(reqDto.getContent())
                .post(post)
                .writer(writer)
                .build();

        commentRepository.save(comment);
    }

    @Transactional
    public void deleteComment(Long commentId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        OAuth2UserDTO oauthUser = (OAuth2UserDTO) authentication.getPrincipal();
        Long userId = Long.parseLong(oauthUser.getName());

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new CustomException(CommentErrorCode.COMMENT_NOT_FOUND));

        if (!comment.getWriter().getId().equals(userId)) {
            throw new CustomException(CommentErrorCode.COMMENT_DELETE_ACCESS_DENIED);
        }

        commentRepository.deleteById(commentId);
    }

    public CommentAllResponseDto getComments(Long postId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        OAuth2UserDTO oauthUser = (OAuth2UserDTO) authentication.getPrincipal();
        Long userId = Long.parseLong(oauthUser.getName());

        boolean isLiked = likeRepository.existsByPostIdAndUserId(postId, userId);
        Long likesCount = likeRepository.countByPostId(postId);
        Long commentsCount = commentRepository.countByPostId(postId);

        List<CommentAllResponseDto.Comment> comments = commentRepository.findByPostId(postId).stream()
                .map(comment -> CommentAllResponseDto.Comment.builder()
                        .commentId(comment.getId())
                        .content(comment.getContent())
                        .createdAt(comment.getCreatedAt())
                        .writer(CommentAllResponseDto.Writer.builder()
                                .userId(comment.getWriter().getId())
                                .nickname(comment.getWriter().getNickname())
                                .imageUrl(comment.getWriter().getImageUrl())
                                .build())
                        .build())
                .toList();

        return CommentAllResponseDto.builder()
                .isLiked(isLiked)
                .likesCount(likesCount)
                .commentsCount(commentsCount)
                .comments(comments)
                .build();
    }
}