package com.king.backend.domain.curation.errorcode;

import com.king.backend.global.exception.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum CurationErrorCode implements ErrorCode {
    CURATION_NOT_FOUND(HttpStatus.NOT_FOUND, "해당 큐레이션 리스트를 찾을 수 없습니다.");

    private final HttpStatus status;
    private final String message;

    @Override
    public String getCode() {
        return name();
    }
}
