package com.king.backend.externaldata.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@Entity
@Table(name = "place")
public class Place {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String type;

    @Column(length = 500)
    private String address;

    @Column(length = 50)
    private String phone;

    @Column(name = "open_hour", length = 255)
    private String openHour;

    @Column(name = "break_time", length = 255)
    private String breakTime;

    @Column(name = "closed_day", length = 255)
    private String closedDay;

    @Column(name = "image_url", length = 500)
    private String imageUrl;  // 이후 Google Map API로 채울 예정

    private Double lat;
    private Double lng;

    @Lob
    private String description;  // 장소설명

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
