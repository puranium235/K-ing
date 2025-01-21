package com.king.backend.global.response;
import lombok.Getter;

@Getter
public class ApiResponse<T> {

    private final boolean success;
    private final T data;
    private final String code;
    private final String message;

    // 생성자를 통해 초기화
    private ApiResponse(boolean success, T data, String code, String message) {
        this.success = success;
        this.data = data;
        this.code = code;
        this.message = message;
    }

    // 성공 응답
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, data, "SUCCESS", "요청 성공");
    }

    // 실패 응답
    public static <T> ApiResponse<T> error(String code, String message) {
        return new ApiResponse<>(false, null, code, message);
    }
}
