package com.king.backend.domain.user.dto.domain;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AuthResult<T> {
    private final String accessToken;
    private final String refreshToken;
    private final long refreshTokenMaxAgeSeconds;
    private final T data;
}
