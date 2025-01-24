package com.king.backend.domain.cast.entity;

import jakarta.persistence.*;
import lombok.Getter;

@Entity
@Getter
public class CastKo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String birthPlace;

    @OneToOne
    @JoinColumn(name = "cast_id", nullable = false)
    private Cast cast;
}
