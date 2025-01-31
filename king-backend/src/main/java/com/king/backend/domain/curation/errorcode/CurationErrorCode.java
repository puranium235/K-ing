package com.king.backend.domain.curation.errorcode;

import com.king.backend.global.exception.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum CurationErrorCode implements ErrorCode {
    CURATION_NOT_FOUND(HttpStatus.NOT_FOUND, "존재하지 않는 큐레이션 id입니다.");

    private final HttpStatus status;
    private final String message;

    @Override
    public String getCode() {
        return name();
    }
}
