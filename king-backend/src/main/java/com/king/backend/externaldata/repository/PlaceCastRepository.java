package com.king.backend.externaldata.repository;

import com.king.backend.externaldata.entity.Cast;
import com.king.backend.externaldata.entity.Place;
import com.king.backend.externaldata.entity.PlaceCast;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PlaceCastRepository extends JpaRepository<PlaceCast, Long> {
    Optional<PlaceCast> findByPlaceAndCast(Place place, Cast cast);
}
