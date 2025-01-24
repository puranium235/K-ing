package com.king.backend.domain.content.entity;

import jakarta.persistence.*;
import lombok.Getter;

@Entity
@Getter
public class ContentKo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    private String description;

    @OneToOne
    @JoinColumn(name = "content_id", nullable = false) // 외래 키 설정
    private Content content;
}
