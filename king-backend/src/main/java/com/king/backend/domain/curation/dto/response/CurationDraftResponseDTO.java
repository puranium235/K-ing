package com.king.backend.domain.curation.dto.response;

import com.king.backend.domain.place.entity.Place;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.Objects;

@Getter
@Setter
public class CurationDraftResponseDTO {
    private String title;
    private String description;
    private byte[] imageData;
    private boolean isPublic;
    private List<PlaceDTO> places;

    @Getter
    @AllArgsConstructor
    public static class PlaceDTO {
        private Long placeId;
        private String name;
        private String address;
        private String imageUrl;

        public static PlaceDTO fromEntity(Place place) {
            return new PlaceDTO(
                    place.getId(),
                    place.getName(),
                    place.getAddress(),
                    Objects.requireNonNullElse(
                            place.getImageUrl(),
                            "https://king-s3-bucket.s3.us-east-1.amazonaws.com/uploads/default.jpg"
                    )
            );
        }
    }
}
