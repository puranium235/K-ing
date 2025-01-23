package com.king.backend.domain.content.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Getter
@NoArgsConstructor
@RequiredArgsConstructor
@AllArgsConstructor
@ToString
public class Content {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String type; // drama, movie, show

    private String broadcast;

    private LocalDateTime createdAt;

    private String imageUrl;

    @Column(nullable = false)
    private Integer tmdbId;

    // 1:1 관계 - 한국어 번역
    @OneToOne(mappedBy = "content", cascade = CascadeType.ALL, orphanRemoval = true)
    private ContentKo translationKo;

    // 1:1 관계 - 영어 번역
    @OneToOne(mappedBy = "content", cascade = CascadeType.ALL, orphanRemoval = true)
    private ContentEn translationEn;

    // 1:1 관계 - 일본어 번역
    @OneToOne(mappedBy = "content", cascade = CascadeType.ALL, orphanRemoval = true)
    private ContentJa translationJa;

    // 1:1 관계 - 중국어 번역
    @OneToOne(mappedBy = "content", cascade = CascadeType.ALL, orphanRemoval = true)
    private ContentZh translationZh;

}