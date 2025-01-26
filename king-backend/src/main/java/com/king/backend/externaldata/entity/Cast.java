package com.king.backend.externaldata.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@Entity
@Table(name = "cast")
public class Cast {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "img_url", length = 500)
    private String imgUrl;  // TMDB 연동 시 채움

    @Column(name = "birth_date", length = 20)
    private String birthDate;

    @Column(name = "birth_place", length = 200)
    private String birthPlace;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "participating_works")
    private Long participatingWorks;

    @Column(name = "tmdb_id", nullable = false, unique = true)
    private Integer tmdbId;

    @PrePersist
    public void onCreate() {
        createdAt = LocalDateTime.now();
    }

}