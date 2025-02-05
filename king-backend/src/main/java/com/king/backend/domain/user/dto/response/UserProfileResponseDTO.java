package com.king.backend.domain.user.dto.response;

import com.king.backend.domain.user.entity.User;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class UserProfileResponseDTO {
    private Long id;
    private String email;
    private String nickname;
    private String imageUrl;
    private String description;

    public static UserProfileResponseDTO fromEntity(User user) {
        return new UserProfileResponseDTO(
                user.getId(),
                user.getEmail(),
                user.getNickname(),
                user.getImageUrl(),
                user.getDescription()
        );
    }
}
