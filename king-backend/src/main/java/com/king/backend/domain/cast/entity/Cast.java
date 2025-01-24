package com.king.backend.domain.cast.entity;

import com.king.backend.domain.content.entity.ContentCast;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.ToString;

import java.time.LocalDateTime;
import java.util.List;

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

    @OneToMany(mappedBy = "cast", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ContentCast> contentCasts;

    @OneToOne(mappedBy = "cast", cascade = CascadeType.ALL, orphanRemoval = true)
    private CastKo translationKo;

    @OneToOne(mappedBy = "cast", cascade = CascadeType.ALL, orphanRemoval = true)
    private CastEn translationEn;

    @OneToOne(mappedBy = "cast", cascade = CascadeType.ALL, orphanRemoval = true)
    private CastJa translationJa;

    @OneToOne(mappedBy = "cast", cascade = CascadeType.ALL, orphanRemoval = true)
    private CastZh translationZh;

}
