package com.king.backend.domain.curation.dto.response;

import com.king.backend.domain.curation.entity.CurationList;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@AllArgsConstructor
public class CurationListResponseDTO {
    private List<CurationDTO> curations;
    private String nextCursor;

    public static CurationListResponseDTO fromEntity(List<CurationList> curations, String nextCursor) {
        return new CurationListResponseDTO(
                curations.stream()
                        .map(CurationDTO::fromEntity)
                        .toList(),
                nextCursor
        );
    }

    @Getter
    @Setter
    @AllArgsConstructor
    private static class CurationDTO {
        private Long curationId;
        private String title;
        private String imageUrl;
        private String writerNickname;
        private boolean isPublic;

        public static CurationDTO fromEntity(CurationList curation) {
            return new CurationDTO(
                    curation.getId(),
                    curation.getTitle(),
                    curation.getImageUrl(),
                    curation.getWriter().getNickname(),
                    curation.isPublic()
            );
        }
    }
}
