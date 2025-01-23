package com.king.backend.domain.place.service;

import com.king.backend.domain.place.entity.Place;
import com.king.backend.domain.place.repository.PlaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PlaceService {
    private final PlaceRepository placeRepository;

    public Place getPlaceDetail(Long placeId){
        return placeRepository.findPlaceById(placeId);
    }

}
