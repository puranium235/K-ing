package com.king.backend.domain.user.service;

import com.king.backend.domain.user.dto.domain.OAuth2UserDTO;
import com.king.backend.domain.user.dto.response.UserProfileResponseDTO;
import com.king.backend.domain.user.entity.User;
import com.king.backend.domain.user.errorcode.UserErrorCode;
import com.king.backend.domain.user.repository.UserRepository;
import com.king.backend.global.exception.CustomException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    public UserProfileResponseDTO getUserById(String id) {
        long userId;
        try {
            userId = Long.parseLong(id);
        } catch (NumberFormatException e) {
            throw new CustomException(UserErrorCode.USER_NOT_FOUND);
        }

        User user = userRepository.findByIdAndStatus(userId, "ROLE_REGISTERED")
                .orElseThrow(() -> new CustomException(UserErrorCode.USER_NOT_FOUND));

        return UserProfileResponseDTO.fromEntity(user);
    }

    public void deleteUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        OAuth2UserDTO authUser = (OAuth2UserDTO) authentication.getPrincipal();

        Long userId = Long.parseLong(authUser.getName());

        User user = userRepository.findByIdAndStatus(userId, "ROLE_REGISTERED")
                .orElseThrow(() -> new CustomException(UserErrorCode.USER_NOT_FOUND));
        userRepository.delete(user);
    }
}
