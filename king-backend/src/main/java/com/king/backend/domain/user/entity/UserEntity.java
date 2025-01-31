package com.king.backend.domain.user.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "user")
public class UserEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String email;

    @Column(unique = true)
    private String nickname;

    @Column(nullable = false)
    private String imageUrl;

    private String googleId;
    private String lineId;
    private LocalDateTime createdAt;
    private String description;
    private Boolean contentAlarmOn;
    private String language;

    @Column(nullable = false)
    private String status;
}
