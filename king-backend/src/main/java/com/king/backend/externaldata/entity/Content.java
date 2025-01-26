package com.king.backend.externaldata.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@Entity
@Table(name="content")
public class Content {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "content_type", nullable = false)
    private String contentType;

    @Column(nullable = false)
    private String title;

    @Column(length = 255)
    private String broadcast;

    @Lob
    private String description;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "image_url", length = 500)
    private String imageUrl;  // TMDB로 채울 예정

    @Column(name = "tmdb_id", nullable = false)
    private Integer tmdbId;

    @PrePersist
    public void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
