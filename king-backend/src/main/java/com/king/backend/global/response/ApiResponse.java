package com.king.backend.global.response;

public class ApiResponse<T> { // Void
    private boolean success;
    private T data;
    private String code;
    private String message;

    // 성공
    public static <T> ApiResponse<T> success(T data){
        ApiResponse<T> response = new ApiResponse<>();
        response.success = true;
        response.data = data;
        response.code = "SUCCESS";
        response.message = "요청 성공";
        return response;
    }

    // 실패 응답
    public static <T> ApiResponse<T> error(String code, String message) {
        ApiResponse<T> response = new ApiResponse<>();
        response.success = false;
        response.code = code;
        response.message = message;
        return response;
    }


}
