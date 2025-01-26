package com.king.backend.externaldata.repository;

import com.king.backend.externaldata.entity.Place;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PlaceRepository extends JpaRepository<Place, Long> {

    Optional<Place> findByNameAndAddress(String name, String address);

    List<Place> findByImageUrlIsNullOrImageUrl(String emptyString);

}
