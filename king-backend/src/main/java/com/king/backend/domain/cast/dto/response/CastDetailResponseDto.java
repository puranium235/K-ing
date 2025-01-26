package com.king.backend.domain.cast.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class CastDetailResponseDto {
    private Long castId;
    private String name;
    private String imageUrl;
    private String birthDate;
    private String birthPlace;
    private Long participatingWorks;
    private String createdAt;
    private List<RelatedContent> relatedContents;
    private List<Work> works;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RelatedContent {
        private Long contentId;
        private String title;
        private String imageUrl;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Work {
        private int year;
        private String title;
    }
}
