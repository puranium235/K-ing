package com.king.backend.domain.user.service;

import com.king.backend.domain.user.dto.domain.AuthResult;
import com.king.backend.domain.user.dto.domain.OAuth2UserDTO;
import com.king.backend.domain.user.dto.request.PatchUserRequestDTO;
import com.king.backend.domain.user.dto.request.SignUpRequestDTO;
import com.king.backend.domain.user.dto.response.SignUpResponseDTO;
import com.king.backend.domain.user.dto.response.UserProfileResponseDTO;
import com.king.backend.domain.user.entity.TokenEntity;
import com.king.backend.domain.user.entity.User;
import com.king.backend.domain.user.errorcode.UserErrorCode;
import com.king.backend.domain.user.jwt.JWTUtil;
import com.king.backend.domain.user.repository.TokenRepository;
import com.king.backend.domain.user.repository.UserRepository;
import com.king.backend.domain.user.util.UserUtil;
import com.king.backend.global.exception.CustomException;
import com.king.backend.s3.service.S3Service;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final TokenRepository tokenRepository;
    private final TokenService tokenService;
    private final S3Service s3Service;
    private final JWTUtil jwtUtil;

    @Value("${spring.jwt.accesstoken-expires-in}")
    private Long ACCESSTOKEN_EXPIRES_IN;

    @Value("${spring.jwt.refreshtoken-expires-in}")
    private Long REFRESHTOKEN_EXPIRES_IN;

    private <T> AuthResult<T> issueTokens(String userId, String language, String role, T data) {
        String accessToken = jwtUtil.createJwt("accessToken", userId, language, role, ACCESSTOKEN_EXPIRES_IN);
        String refreshToken = jwtUtil.createJwt("refreshToken", userId, language, role, REFRESHTOKEN_EXPIRES_IN);

        tokenRepository.deleteById(Long.parseLong(userId));
        tokenRepository.save(new TokenEntity(Long.parseLong(userId), refreshToken, REFRESHTOKEN_EXPIRES_IN));

        return new AuthResult<>(accessToken, refreshToken, REFRESHTOKEN_EXPIRES_IN / 1000, data);
    }

    public AuthResult<Void> tokenRefresh(String oldRefreshToken) {
        if (oldRefreshToken == null) {
            throw new CustomException(UserErrorCode.INVALID_TOKEN);
        }

        Claims claims;
        try {
            claims = jwtUtil.validToken(oldRefreshToken);
        } catch (Exception e) {
            throw new CustomException(UserErrorCode.INVALID_TOKEN);
        }

        if (!jwtUtil.getType(claims).equals("refreshToken")) {
            throw new CustomException(UserErrorCode.INVALID_TOKEN);
        }

        String userId = jwtUtil.getUserId(claims);
        String language = jwtUtil.getLanguage(claims);
        String role = jwtUtil.getRole(claims);

        Optional<TokenEntity> token = tokenService.findTokenById(Long.parseLong(userId));
        if (token.isEmpty() || !token.get().getRefreshToken().equals(oldRefreshToken)) {
            throw new CustomException(UserErrorCode.INVALID_TOKEN);
        }

        return issueTokens(userId, language, role, null);
    }

    public AuthResult<SignUpResponseDTO> signup(SignUpRequestDTO signUpRequestDTO) {
        String nickname = signUpRequestDTO.getNickname();
        if (!UserUtil.isValidNickname(nickname)) {
            throw new CustomException(UserErrorCode.INVALID_NICKNAME);
        }
        nickname = nickname.trim();

        userRepository.findByNickname(nickname)
                .ifPresent((user) -> {
                    throw new CustomException(UserErrorCode.DUPLICATED_NICKNAME);
                });

        String language = signUpRequestDTO.getLanguage();
        if (!UserUtil.isValidLanguage(language)) {
            throw new CustomException(UserErrorCode.INVALID_LANGUAGE);
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Long userId = Long.parseLong(authentication.getName());

        User findUser = userRepository.findByIdAndStatus(userId, "ROLE_PENDING")
                .orElseThrow(() -> new CustomException(UserErrorCode.NOT_PENDING_USER));

        findUser.setNickname(nickname);
        findUser.setLanguage(language);
        findUser.setCreatedAt(LocalDateTime.now());
        findUser.setContentAlarmOn(true);
        findUser.setStatus("ROLE_REGISTERED");

        userRepository.save(findUser);

        SignUpResponseDTO responseDTO = new SignUpResponseDTO();
        responseDTO.setUserId(findUser.getId());
        responseDTO.setEmail(findUser.getEmail());
        responseDTO.setNickname(findUser.getNickname());
        responseDTO.setImageUrl(findUser.getImageUrl());
        responseDTO.setLanguage(findUser.getLanguage());

        return issueTokens(userId.toString(), language, "ROLE_REGISTERED", responseDTO);
    }

    public UserProfileResponseDTO getUserById(String id) {
        long userId;
        try {
            userId = Long.parseLong(id);
        } catch (NumberFormatException e) {
            throw new CustomException(UserErrorCode.USER_NOT_FOUND);
        }

        User user = userRepository.findByIdAndStatus(userId, "ROLE_REGISTERED")
                .orElseThrow(() -> new CustomException(UserErrorCode.USER_NOT_FOUND));

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        OAuth2UserDTO authUser = (OAuth2UserDTO) authentication.getPrincipal();

        Long requestUserId = Long.parseLong(authUser.getName());

        if (userId == requestUserId) {
            return UserProfileResponseDTO.fromSelfEntity(user);
        }

        return UserProfileResponseDTO.fromEntity(user);
    }

    public void deleteUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        OAuth2UserDTO authUser = (OAuth2UserDTO) authentication.getPrincipal();

        Long userId = Long.parseLong(authUser.getName());

        User user = userRepository.findByIdAndStatus(userId, "ROLE_REGISTERED")
                .orElseThrow(() -> new CustomException(UserErrorCode.USER_NOT_FOUND));
        userRepository.delete(user);
        tokenRepository.deleteById(userId);
    }

    public AuthResult<UserProfileResponseDTO> patchUser(PatchUserRequestDTO userRequestDTO, MultipartFile imageFile) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        OAuth2UserDTO authUser = (OAuth2UserDTO) authentication.getPrincipal();
        Long userId = Long.parseLong(authUser.getName());
        User user = userRepository.findByIdAndStatus(userId, "ROLE_REGISTERED")
                .orElseThrow(() -> new CustomException(UserErrorCode.USER_NOT_FOUND));

        if (userRequestDTO.getNickname() != null) {
            String nickname = userRequestDTO.getNickname().trim();

            if (!UserUtil.isValidNickname(nickname)) {
                throw new CustomException(UserErrorCode.INVALID_NICKNAME);
            }

            userRepository.findByNickname(nickname)
                    .ifPresent((findUser) -> {
                        if (!findUser.getId().equals(userId)) {
                            throw new CustomException(UserErrorCode.DUPLICATED_NICKNAME);
                        }
                    });

            user.setNickname(nickname);
        }

        if (userRequestDTO.getLanguage() != null) {
            String language = userRequestDTO.getLanguage();

            if (!UserUtil.isValidLanguage(language)) {
                throw new CustomException(UserErrorCode.INVALID_LANGUAGE);
            }

            user.setLanguage(language);
        }

        if (userRequestDTO.getDescription() != null) {
            String description = userRequestDTO.getDescription();

            if (!UserUtil.isValidDescription(description)) {
                throw new CustomException(UserErrorCode.INVALD_VALUE);
            }

            user.setDescription(description);
        }

        if (userRequestDTO.getContentAlarmOn() != null) {
            user.setContentAlarmOn(userRequestDTO.getContentAlarmOn());
        }

        if (imageFile != null && !imageFile.isEmpty()) {
            String imageUrl = s3Service.uploadFile(user, imageFile);
            user.setImageUrl(imageUrl);
        }

        userRepository.save(user);

        return issueTokens(userId.toString(), user.getLanguage(), "ROLE_REGISTERED",
                UserProfileResponseDTO.fromSelfEntity(user));
    }
}
