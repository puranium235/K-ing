package com.king.backend.domain.user.dto.domain;

import lombok.Getter;
import lombok.Setter;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.Map;

@Getter
@Setter
public class LineUserDTO {
    private String lineId;
    private String email;
    private String imageUrl;

    public static LineUserDTO from(OAuth2User oAuth2User) {
        Map<String, Object> attribute = oAuth2User.getAttributes();

        LineUserDTO lineUserDTO = new LineUserDTO();
        lineUserDTO.setLineId(attribute.get("userId").toString());

        return lineUserDTO;
    }
}
