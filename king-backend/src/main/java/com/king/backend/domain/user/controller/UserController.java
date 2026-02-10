package com.king.backend.domain.user.controller;

import com.king.backend.domain.user.dto.domain.AuthResult;
import com.king.backend.domain.user.dto.request.PatchUserRequestDTO;
import com.king.backend.domain.user.dto.request.SignUpRequestDTO;
import com.king.backend.domain.user.dto.response.NicknameResponseDTO;
import com.king.backend.domain.user.dto.response.UserProfileResponseDTO;
import com.king.backend.domain.user.dto.response.SignUpResponseDTO;
import com.king.backend.domain.user.errorcode.UserErrorCode;
import com.king.backend.domain.user.repository.UserRepository;
import com.king.backend.domain.user.service.UserService;
import com.king.backend.domain.user.util.UserUtil;
import com.king.backend.global.exception.CustomException;
import com.king.backend.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
@Tag(name = "유저", description = "유저 가입, 로그인, 토큰 관리, 유저 정보 조회 및 수정")
public class UserController {

    private final UserRepository userRepository;
    private final UserService userService;

    private <T> ResponseEntity<ApiResponse<T>> buildAuthResponse(AuthResult<T> result, HttpStatus status) {
        ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", result.getRefreshToken())
                .httpOnly(true)
                .path("/")
                .maxAge(result.getRefreshTokenMaxAgeSeconds())
                .build();

        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.AUTHORIZATION, "Bearer " + result.getAccessToken());
        headers.add(HttpHeaders.SET_COOKIE, refreshCookie.toString());

        return ResponseEntity.status(status).headers(headers).body(ApiResponse.success(result.getData()));
    }

    @Operation(summary = "refreshToken(cookie)로 accessToken 재발급")
    @PostMapping("/token-refresh")
    public ResponseEntity<ApiResponse<Void>> tokenRefresh(@CookieValue(value = "refreshToken", required = false) String oldRefreshToken) {
        AuthResult<Void> result = userService.tokenRefresh(oldRefreshToken);
        return buildAuthResponse(result, HttpStatus.OK);
    }

    @Operation(summary = "닉네임 등록 및 가입")
    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<SignUpResponseDTO>> signup(@RequestBody SignUpRequestDTO signUpRequestDTO) {
        AuthResult<SignUpResponseDTO> result = userService.signup(signUpRequestDTO);
        return buildAuthResponse(result, HttpStatus.CREATED);
    }

    @Operation(summary = "닉네임 중복 조회")
    @GetMapping("/nickname")
    public ResponseEntity<ApiResponse<NicknameResponseDTO>> getNicknameDuplication(@RequestParam(value = "nickname", required = false) String nickname) {
        if (!UserUtil.isValidNickname(nickname)) {
            throw new CustomException(UserErrorCode.INVALID_NICKNAME);
        }
        nickname = nickname.trim();

        userRepository.findByNickname(nickname)
                .ifPresent((user) -> {
                    throw new CustomException(UserErrorCode.DUPLICATED_NICKNAME);
                });

        NicknameResponseDTO response = new NicknameResponseDTO();
        response.setNickname(nickname);
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(response));
    }

    @Operation(summary = "유저 정보 조회")
    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<UserProfileResponseDTO>> getUserProfile(@PathVariable(value = "userId") String userId) {
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(userService.getUserById(userId)));
    }

    @Operation(summary = "현재 로그인된 유저 탈퇴")
    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> deleteUser() {
        userService.deleteUser();

        ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", null)
                .httpOnly(true)
                .path("/")
                .maxAge(0)
                .build();

        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.SET_COOKIE, refreshCookie.toString());

        return ResponseEntity.status(HttpStatus.NO_CONTENT).headers(headers).body(ApiResponse.success(null));
    }

    @Operation(summary = "유저 정보 수정")
    @PatchMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<UserProfileResponseDTO>> patchUser(
            @RequestPart(value = "user") PatchUserRequestDTO patchUserRequestDTO,
            @RequestPart(value = "imageFile", required = false) MultipartFile imageFile) {

        AuthResult<UserProfileResponseDTO> result = userService.patchUser(patchUserRequestDTO, imageFile);
        return buildAuthResponse(result, HttpStatus.OK);
    }
}
