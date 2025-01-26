package com.king.backend.externaldata.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@Entity
@Table(name = "place_cast", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"place_id", "cast_id"})
})
public class PlaceCast {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "place_id", nullable = false)
    private Place place;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cast_id", nullable = false)
    private Cast cast;

    @Lob
    private String description;
}
