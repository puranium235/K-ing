package com.king.backend.domain.place.service;

import com.king.backend.domain.content.entity.Content;
import com.king.backend.domain.place.dto.response.PlaceDetailResponseDto;
import com.king.backend.domain.place.entity.Place;
import com.king.backend.domain.place.entity.PlaceContent;
import com.king.backend.domain.place.repository.PlaceRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PlaceService {
    private final PlaceRepository placeRepository;

    @Transactional
    public PlaceDetailResponseDto getPlaceDetail(Long id){
        Place place = placeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("여기부터 안됨"));
        List<PlaceDetailResponseDto.AdditionalInfo> additionalInfo = place.getPlaceContents().stream()
                .map(this::mapToAdditionalInfo)
                .collect(Collectors.toList());

        return new PlaceDetailResponseDto(
                place.getId(),
                place.getName(),
                place.getType(),
                place.getAddress(),
                place.getPhone(),
                place.getOpenHour(),
                place.getBreakTime(),
                place.getClosedDay(),
                (double) place.getLat(),
                (double) place.getLng(),
                place.getCreatedAt(),
                place.getImageUrl(),
                additionalInfo

        );

    }

    private PlaceDetailResponseDto.AdditionalInfo mapToAdditionalInfo(PlaceContent placeContent) {
        Content content = placeContent.getContent();
        return new PlaceDetailResponseDto.AdditionalInfo(
                content.getId(),
                content.getTranslationKo().getTitle(),
                content.getType(),
                placeContent.getDescription()
        );
    }

}
