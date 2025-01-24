package com.king.backend.domain.user.errorcode;

import com.king.backend.global.exception.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum UserErrorCode implements ErrorCode {
    OAUTH2_LOGIN_FAILED(HttpStatus.BAD_REQUEST, "소셜로그인 사용자를 받아올 수 없습니다.");

    private final HttpStatus status;
    private final String message;

    @Override
    public String getCode() {
        return name();
    }
}
