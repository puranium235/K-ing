package com.king.backend.domain.place.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class PlaceDetailResponseDto {
    private Long placeId;
    private String name;
    private String type; // cafe, playground, restaurant, shop, station, stay, store
    private String address;
    private String phone;
    private String openHour;
    private String breakTime;
    private String closedDay;
    private Double lat;
    private Double lng;
    private LocalDateTime createdAt;
    private String placeImage;
    private List<AdditionalInfo> additionalInfo;

    @NoArgsConstructor
    @AllArgsConstructor
    @Data
    public static class AdditionalInfo {
        private Long contentId;
        private String title;
        private String type; // drama, movie, show
        private String description;
    }
}
