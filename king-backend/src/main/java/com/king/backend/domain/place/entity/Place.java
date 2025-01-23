package com.king.backend.domain.place.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
@RequiredArgsConstructor
@AllArgsConstructor
@Entity
@ToString
public class Place {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String description;

    private String openHour;

    private String breakTime;

    private String closedDay;

    private String address;

    @Column(nullable = false)
    private float lat;

    @Column(nullable = false)
    private float lng;

    private String phone;

    private String image_url;

    private LocalDateTime created_at;

    @Column(nullable = false)
    private Long views = 0L; // 기본값 설정

}
