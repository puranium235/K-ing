package com.king.backend.domain.cast.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.ToString;

import java.time.LocalDateTime;

@Entity
@Getter
@RequiredArgsConstructor
@AllArgsConstructor
@ToString
public class Cast {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String imageUrl;

    private String birthDate;

    private Long participatingWork;

    private LocalDateTime createdAt;

    @Column(nullable = false)
    private Long tmdbId;

    @OneToOne(mappedBy = "cast", cascade = CascadeType.ALL, orphanRemoval = true)
    private CastKo translationKo;

    @OneToOne(mappedBy = "cast", cascade = CascadeType.ALL, orphanRemoval = true)
    private CastEn translationEn;

    @OneToOne(mappedBy = "cast", cascade = CascadeType.ALL, orphanRemoval = true)
    private CastJa translationJa;

    @OneToOne(mappedBy = "cast", cascade = CascadeType.ALL, orphanRemoval = true)
    private CastZh translationZh;

}
