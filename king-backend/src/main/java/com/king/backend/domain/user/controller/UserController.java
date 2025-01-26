package com.king.backend.domain.user.controller;

import com.king.backend.domain.user.dto.request.SignUpRequestDTO;
import com.king.backend.domain.user.dto.response.SignUpResponseDTO;
import com.king.backend.domain.user.entity.UserEntity;
import com.king.backend.domain.user.errorcode.UserErrorCode;
import com.king.backend.domain.user.repository.UserRepository;
import com.king.backend.global.exception.CustomException;
import com.king.backend.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collection;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

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
