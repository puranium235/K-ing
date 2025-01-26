package com.king.backend.externaldata.repository;

import com.king.backend.externaldata.entity.PlaceContent;
import com.king.backend.externaldata.entity.Place;
import com.king.backend.externaldata.entity.Content;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PlaceContentRepository extends JpaRepository<PlaceContent, Long> {
    Optional<PlaceContent> findByPlaceAndContent(Place place, Content content);
}
