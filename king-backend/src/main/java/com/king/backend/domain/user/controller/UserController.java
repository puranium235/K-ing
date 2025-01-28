package com.king.backend.domain.user.controller;

import com.king.backend.domain.user.dto.request.SignUpRequestDTO;
import com.king.backend.domain.user.dto.response.SignUpResponseDTO;
import com.king.backend.domain.user.entity.UserEntity;
import com.king.backend.domain.user.errorcode.UserErrorCode;
import com.king.backend.domain.user.jwt.JWTUtil;
import com.king.backend.domain.user.repository.UserRepository;
import com.king.backend.global.exception.CustomException;
import com.king.backend.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Collection;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final JWTUtil jwtUtil;

    @Value("${spring.jwt.accesstoken-expires-in}")
    private Long ACCESSTOKEN_EXPIRES_IN;

    @Value("${spring.jwt.refreshtoken-expires-in}")
    private Long REFRESHTOKEN_EXPIRES_IN;

    @PostMapping("/token-refresh")
    public ResponseEntity<ApiResponse<Void>> tokenRefresh(@CookieValue("refreshToken") String oldRefreshToken) {
        if (oldRefreshToken == null) {
            throw new CustomException(UserErrorCode.INVALID_TOKEN);
        }

        if (jwtUtil.isExpired(oldRefreshToken)) {
            throw new CustomException(UserErrorCode.REFRESHTOKEN_EXPIRED);
        }

        if (!jwtUtil.getType(oldRefreshToken).equals("refreshToken")) {
            throw new CustomException(UserErrorCode.INVALID_TOKEN);
        }

        String userId = jwtUtil.getUserId(oldRefreshToken);
        String role = jwtUtil.getRole(oldRefreshToken);

        String accessToken = jwtUtil.createJwt("accessToken", userId, role, ACCESSTOKEN_EXPIRES_IN);
        String refreshToken = jwtUtil.createJwt("refreshToken", userId, role, REFRESHTOKEN_EXPIRES_IN);

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
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        Long userId = Long.parseLong(authentication.getName());
        Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();

        UserEntity findUser = userRepository.findByIdAndStatus(userId, "ROLE_PENDING")
                .orElseThrow(() -> new CustomException(UserErrorCode.NOT_PENDING_USER));

        findUser.setNickname(signUpRequestDTO.getNickname());
        findUser.setLanguage(signUpRequestDTO.getLanguage());
        findUser.setStatus("ROLE_REGISTERED");

        userRepository.save(findUser);

        SignUpResponseDTO responseDTO = new SignUpResponseDTO();
        responseDTO.setUserId(findUser.getId());
        responseDTO.setEmail(findUser.getEmail());
        responseDTO.setNickname(findUser.getNickname());
        responseDTO.setImageUrl(findUser.getImageUrl());
        responseDTO.setLanguage(findUser.getLanguage());

        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(responseDTO));
    }
}
