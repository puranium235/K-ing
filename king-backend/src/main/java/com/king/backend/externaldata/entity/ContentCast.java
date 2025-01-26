package com.king.backend.externaldata.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@Entity
@Table(name = "content_cast", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"content_id", "cast_id"})
})
public class ContentCast {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "content_id", nullable = false)
    private Content content;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cast_id", nullable = false)
    private Cast cast;

    @Column(length = 255)
    private String role;
}
