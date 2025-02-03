package com.king.backend.domain.user.controller;

import com.king.backend.domain.user.dto.request.SignUpRequestDTO;
import com.king.backend.domain.user.dto.response.NicknameResponseDTO;
import com.king.backend.domain.user.dto.response.SignUpResponseDTO;
import com.king.backend.domain.user.entity.TokenEntity;
import com.king.backend.domain.user.entity.User;
import com.king.backend.domain.user.errorcode.UserErrorCode;
import com.king.backend.domain.user.jwt.JWTUtil;
import com.king.backend.domain.user.repository.TokenRepository;
import com.king.backend.domain.user.repository.UserRepository;
import com.king.backend.domain.user.service.TokenService;
import com.king.backend.global.exception.CustomException;
import com.king.backend.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final JWTUtil jwtUtil;
    private final TokenService tokenService;
    private final TokenRepository tokenRepository;

    @Value("${spring.jwt.accesstoken-expires-in}")
    private Long ACCESSTOKEN_EXPIRES_IN;

    @Value("${spring.jwt.refreshtoken-expires-in}")
    private Long REFRESHTOKEN_EXPIRES_IN;

    @PostMapping("/token-refresh")
        public ResponseEntity<ApiResponse<Void>> tokenRefresh(@CookieValue(value = "refreshToken", required = false) String oldRefreshToken) {
            if (oldRefreshToken == null) {
                throw new CustomException(UserErrorCode.INVALID_TOKEN);
            }

        try {
            jwtUtil.validToken(oldRefreshToken);
        } catch (Exception e) {
            throw new CustomException(UserErrorCode.INVALID_TOKEN);
        }

        if (!jwtUtil.getType(oldRefreshToken).equals("refreshToken")) {
            throw new CustomException(UserErrorCode.INVALID_TOKEN);
        }

        String userId = jwtUtil.getUserId(oldRefreshToken);
        String role = jwtUtil.getRole(oldRefreshToken);

        Optional<TokenEntity> token = tokenService.findTokenById(Long.parseLong(userId));
        if (token.isEmpty() || !token.get().getRefreshToken().equals(oldRefreshToken)) {
            throw new CustomException(UserErrorCode.INVALID_TOKEN);
        }

        String accessToken = jwtUtil.createJwt("accessToken", userId, role, ACCESSTOKEN_EXPIRES_IN);
        String refreshToken = jwtUtil.createJwt("refreshToken", userId, role, REFRESHTOKEN_EXPIRES_IN);

        tokenRepository.deleteById(Long.parseLong(userId));
        tokenRepository.save(new TokenEntity(Long.parseLong(userId), refreshToken, REFRESHTOKEN_EXPIRES_IN));

        ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)
                .path("/")
                .maxAge(REFRESHTOKEN_EXPIRES_IN)
                .build();

        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken);
        headers.add(HttpHeaders.SET_COOKIE, refreshCookie.toString());

        return ResponseEntity.status(HttpStatus.OK).headers(headers).body(ApiResponse.success(null));
    }

    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<SignUpResponseDTO>> signup(@RequestBody SignUpRequestDTO signUpRequestDTO) {
        String nickname = signUpRequestDTO.getNickname();
        if (nickname == null || nickname.trim().length() == 0 || nickname.length() > 50) {
            throw new CustomException(UserErrorCode.INVALID_NICKNAME);
        }
        nickname = nickname.trim();

        userRepository.findByNickname(nickname)
                .ifPresent((user) -> {
                    throw new CustomException(UserErrorCode.DUPLICATED_NICKNAME);
                });

        String language = signUpRequestDTO.getLanguage();
        if (language.matches("^(ko|en|ja|zh)$")) {
            throw new CustomException(UserErrorCode.INVALID_LANGUAGE);
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        Long userId = Long.parseLong(authentication.getName());

        User findUser = userRepository.findByIdAndStatus(userId, "ROLE_PENDING")
                .orElseThrow(() -> new CustomException(UserErrorCode.NOT_PENDING_USER));

        findUser.setNickname(nickname);
        findUser.setLanguage(language);
        findUser.setStatus("ROLE_REGISTERED");

        userRepository.save(findUser);

        String accessToken = jwtUtil.createJwt("accessToken", userId.toString(), "ROLE_REGISTERED", ACCESSTOKEN_EXPIRES_IN);
        String refreshToken = jwtUtil.createJwt("refreshToken", userId.toString(), "ROLE_REGISTERED", REFRESHTOKEN_EXPIRES_IN);

        tokenRepository.deleteById(userId);
        tokenRepository.save(new TokenEntity(userId, refreshToken, REFRESHTOKEN_EXPIRES_IN));

        ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)
                .path("/")
                .maxAge(REFRESHTOKEN_EXPIRES_IN)
                .build();

        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken);
        headers.add(HttpHeaders.SET_COOKIE, refreshCookie.toString());

        SignUpResponseDTO responseDTO = new SignUpResponseDTO();
        responseDTO.setUserId(findUser.getId());
        responseDTO.setEmail(findUser.getEmail());
        responseDTO.setNickname(findUser.getNickname());
        responseDTO.setImageUrl(findUser.getImageUrl());
        responseDTO.setLanguage(findUser.getLanguage());

        return ResponseEntity.status(HttpStatus.CREATED).headers(headers).body(ApiResponse.success(responseDTO));
    }

    @GetMapping("/nickname")
    public ResponseEntity<ApiResponse<NicknameResponseDTO>> getNicknameDuplication(@RequestParam(value = "nickname", required = false) String nickname) {
        if (nickname == null || nickname.trim().length() == 0 || nickname.length() > 50) {
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
}
