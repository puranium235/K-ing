package com.king.backend.domain.post.dto.response;

import lombok.*;

import java.time.OffsetDateTime;
import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class PostAllResponseDto {
    private Long postId;
    private String imageUrl;
    private Long likesCnt;
    private Long commentsCnt;
    private Writer writer;
    private String content;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    @Getter
    @AllArgsConstructor
    @Builder
    public static class Writer {
        private Long userId;
        private String nickname;
    }

    @Getter
    @Builder
    @AllArgsConstructor
    public static class CursorResponse {
        private List<PostAllResponseDto> posts;
        private OffsetDateTime nextCursor;
    }
}
