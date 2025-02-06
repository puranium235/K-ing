package com.king.backend.domain.user.dto.request;

import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
public class PatchUserRequestDTO {
    private String nickname;
    private String description;
    private MultipartFile image;
}
