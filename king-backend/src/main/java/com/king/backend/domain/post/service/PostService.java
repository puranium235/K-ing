package com.king.backend.domain.post.service;

import com.king.backend.domain.place.entity.Place;
import com.king.backend.domain.place.errorcode.PlaceErrorCode;
import com.king.backend.domain.place.repository.PlaceRepository;
import com.king.backend.domain.post.dto.request.PostUploadRequestDto;
import com.king.backend.domain.post.dto.response.PostAllResponseDto;
import com.king.backend.domain.post.dto.response.PostDetailResponseDto;
import com.king.backend.domain.post.entity.Post;
import com.king.backend.domain.post.entity.PostImage;
import com.king.backend.domain.post.errorcode.PostErrorCode;
import com.king.backend.domain.post.repository.CommentRepository;
import com.king.backend.domain.post.repository.LikeRepository;
import com.king.backend.domain.post.repository.PostImageRepository;
import com.king.backend.domain.post.repository.PostRepository;
import com.king.backend.domain.user.dto.domain.OAuth2UserDTO;
import com.king.backend.domain.user.entity.User;
import com.king.backend.domain.user.errorcode.UserErrorCode;
import com.king.backend.domain.user.repository.UserRepository;
import com.king.backend.global.exception.CustomException;
import com.king.backend.s3.service.S3Service;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
@Slf4j
public class PostService {
    private final S3Service s3Service;
    private final UserRepository userRepository;
    private final PlaceRepository placeRepository;
    private final PostRepository postRepository;
    private final PostImageRepository postImageRepository;
    private final LikeRepository likeRepository;
    private final CommentRepository commentRepository;

    @Transactional
    public Long uploadPost(PostUploadRequestDto reqDto, MultipartFile imageFile) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        OAuth2UserDTO user = (OAuth2UserDTO) authentication.getPrincipal();
        Long userId = Long.parseLong(user.getName());
        User writer = userRepository.findById(userId).orElseThrow(() -> new CustomException(UserErrorCode.USER_NOT_FOUND));

        Place place = placeRepository.findById(reqDto.getPlaceId())
                .orElseThrow(() -> new CustomException(PlaceErrorCode.PLACE_NOT_FOUND));

        Post post = Post.builder()
                .content(reqDto.getContent())
                .writer(writer)
                .place(place)
                .build();
        postRepository.save(post);

        if(imageFile != null && !imageFile.isEmpty()){
            String imageUrl = s3Service.uploadFile(imageFile);
            PostImage postImage = PostImage.builder()
                    .imageUrl(imageUrl)
                    .post(post)
                    .build();
            postImageRepository.save(postImage);
        }
        return post.getId();
    }

    @Transactional
    public List<PostAllResponseDto> getAllPosts() {
        List<Post> posts = postRepository.findAll();

        return posts.stream().map(post -> {
            String imageUrl = postImageRepository.findByPostId(post.getId())
                    .map(PostImage::getImageUrl)
                    .orElse(null);

            Long likesCount = likeRepository.countByPostId(post.getId());
            Long commentsCount = commentRepository.countByPostId(post.getId());

            return PostAllResponseDto.builder()
                    .postId(post.getId())
                    .imageUrl(imageUrl)
                    .likesCnt(likesCount)
                    .commentsCnt(commentsCount)
                    .writer(new PostAllResponseDto.Writer(post.getWriter().getId(), post.getWriter().getNickname()))
                    .content(post.getContent())
                    .createdAt(post.getCreatedAt())
                    .updatedAt(post.getUpdatedAt())
                    .build();
        }).collect(Collectors.toList());
    }

    @Transactional
    public PostDetailResponseDto getPostDetail(Long postId) {
        Post post = postRepository.findById(postId).orElseThrow(() -> new CustomException(PostErrorCode.POST_NOT_FOUND));
        User writer = post.getWriter();
        String imageUrl = postImageRepository.findByPostId(postId).map(PostImage::getImageUrl).orElse(null);

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        OAuth2UserDTO oauthUser = (OAuth2UserDTO) authentication.getPrincipal();
        Long userId = Long.parseLong(oauthUser.getName());

        boolean isLiked = likeRepository.existsByPostIdAndUserId(postId, userId);
        Long likesCount = likeRepository.countByPostId(postId);
        Long commentsCount = commentRepository.countByPostId(postId);

        List<PostDetailResponseDto.Comment> comments = commentRepository.findByPostId(postId).stream()
                .map(comment -> PostDetailResponseDto.Comment.builder()
                        .commentId(comment.getId())
                        .content(comment.getContent())
                        .createdAt(comment.getCreatedAt())
                        .writer(PostDetailResponseDto.Writer.builder()
                                .userId(comment.getWriter().getId())
                                .nickname(comment.getWriter().getNickname())
                                .imageUrl(comment.getWriter().getImageUrl())
                                .build())
                        .build())
                .toList();

        return PostDetailResponseDto.builder()
                .postId(post.getId())
                .content(post.getContent())
                .createdAt(post.getCreatedAt())
                .imageUrl(imageUrl)
                .writer(PostDetailResponseDto.Writer.builder()
                        .userId(writer.getId())
                        .nickname(writer.getNickname())
                        .imageUrl(writer.getImageUrl())
                        .build())
                .place(PostDetailResponseDto.Place.builder()
                        .placeId(post.getPlace().getId())
                        .name(post.getPlace().getName())
                        .build())
                .isLiked(isLiked)
                .likesCount(likesCount)
                .commentsCount(commentsCount)
                .comments(comments)
                .build();
    }
}
