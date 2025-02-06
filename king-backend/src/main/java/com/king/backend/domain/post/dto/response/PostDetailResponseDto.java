package com.king.backend.domain.post.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.OffsetDateTime;
import java.util.List;

@Getter
@AllArgsConstructor
@Builder
public class PostDetailResponseDto {
    private Long postId;
    private Writer writer;
    private Place place;
    private String content;
    private String imageUrl;
    private OffsetDateTime createdAt;
    private boolean isLiked;
    private Long likesCount;
    private Long commentsCount;
    private List<Comment> comments;

    @Getter
    @AllArgsConstructor
    @Builder
    public static class Writer {
        private Long userId;
        private String nickname;
        private String imageUrl;
    }

    @Getter
    @AllArgsConstructor
    @Builder
    public static class Place {
        private Long placeId;
        private String name;
    }

    @Getter
    @AllArgsConstructor
    @Builder
    public static class Comment {
        private Long commentId;
        private String content;
        private OffsetDateTime createdAt;
        private Writer writer; // 댓글 작성자 정보 포함
    }
}

