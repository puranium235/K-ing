package com.king.backend.search.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.elasticsearch.annotations.DateFormat;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.List;

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
    private String category;
    private String type;
    private String name;
    private String details;
    private String imageUrl;
    private Long originalId;
    private int popularity;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSX", timezone = "UTC")
    @Field(type = FieldType.Date,
            format = DateFormat.date_optional_time,
            pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSX")
    private OffsetDateTime createdAt;

    private String openHour;
    private String breakTime;
    private String closedDay;
    private String address;
    private double lat;
    private double lng;

    private List<String> associatedCastNames;
    private List<String> associatedContentNames;
}
