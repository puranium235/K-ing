package com.king.backend.domain.post.dto.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostDraftRequestDto {
    private String content;
    private Place place;
    private String imageUrl;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Place {
        private Long placeId;
        private String name;
    }
}
