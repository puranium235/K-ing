package com.king.backend.search.entity;

import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.elasticsearch.annotations.Document;

/**
 * Elasticsearch 도큐먼트 매핑
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(indexName = "search-index")
public class SearchDocument {
    @Id
    private String id;
    private String category; // CAST, SHOW, MOVIE, DRAMA, PLACE
    private String name; // 명칭
    private String details; // 상세 설명 및 추가 정보
    private String imageUrl; // 이미지 URL
    private Long originalId; // 원본 데이터의 ID (MySQL의 ID)
}
