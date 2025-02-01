package com.king.backend.search.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.elasticsearch.annotations.Document;

import java.time.LocalDateTime;

/**
 * Elasticsearch 도큐먼트 매핑
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(indexName = "search-index", createIndex = false)
@JsonIgnoreProperties(value = "_class", allowGetters = true)
public class SearchDocument {
    @Id
    private String id;
    private String category; // CAST, SHOW, MOVIE, DRAMA, PLACE
    private String type; // e.g., for Content: movie, show, drama; for Place: cafe, playground, etc.
    private String name; // 명칭
    private String details; // 상세 설명 및 추가 정보
    private String imageUrl; // 이미지 URL
    private Long originalId; // 원본 데이터의 ID (MySQL의 ID)
    private int popularity;
    private LocalDateTime createdAt;

    private String openHour;
    private String breakTime;
    private String closedDay;
    private String address;
    private double lat;
    private double lng;
}
