package com.king.backend.domain.user.service;

import com.king.backend.domain.user.dto.domain.AuthResult;
import com.king.backend.domain.user.dto.request.PatchUserRequestDTO;
import com.king.backend.domain.user.dto.request.SignUpRequestDTO;
import com.king.backend.domain.user.dto.response.NicknameResponseDTO;
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
import com.king.backend.global.util.SecurityUtil;
import com.king.backend.s3.service.S3Service;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
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

    private String validateAndTrimNickname(String nickname, Long excludeUserId) {
        if (!UserUtil.isValidNickname(nickname)) {
            throw new CustomException(UserErrorCode.INVALID_NICKNAME);
        }
        String trimmed = nickname.trim();

        userRepository.findByNickname(trimmed)
                .ifPresent((user) -> {
                    if (excludeUserId == null || !user.getId().equals(excludeUserId)) {
                        throw new CustomException(UserErrorCode.DUPLICATED_NICKNAME);
                    }
                });

        return trimmed;
    }

    public NicknameResponseDTO checkNicknameDuplication(String nickname) {
        String trimmed = validateAndTrimNickname(nickname, null);

        NicknameResponseDTO response = new NicknameResponseDTO();
        response.setNickname(trimmed);
        return response;
    }

    public AuthResult<SignUpResponseDTO> signup(SignUpRequestDTO signUpRequestDTO) {
        String nickname = validateAndTrimNickname(signUpRequestDTO.getNickname(), null);

        String language = signUpRequestDTO.getLanguage();
        if (!UserUtil.isValidLanguage(language)) {
            throw new CustomException(UserErrorCode.INVALID_LANGUAGE);
        }

        Long userId = SecurityUtil.getCurrentUserId();

        User findUser = userRepository.findByIdAndStatus(userId, "ROLE_PENDING")
                .orElseThrow(() -> new CustomException(UserErrorCode.NOT_PENDING_USER));

        findUser.setNickname(nickname);
        findUser.setLanguage(language);
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

        Long requestUserId = SecurityUtil.getCurrentUserId();

        if (userId == requestUserId) {
            return UserProfileResponseDTO.fromSelfEntity(user);
        }

        return UserProfileResponseDTO.fromEntity(user);
    }

    public void deleteUser() {
        Long userId = SecurityUtil.getCurrentUserId();

        User user = userRepository.findByIdAndStatus(userId, "ROLE_REGISTERED")
                .orElseThrow(() -> new CustomException(UserErrorCode.USER_NOT_FOUND));
        userRepository.delete(user);
        tokenRepository.deleteById(userId);
    }

    public AuthResult<UserProfileResponseDTO> patchUser(PatchUserRequestDTO userRequestDTO, MultipartFile imageFile) {
        Long userId = SecurityUtil.getCurrentUserId();
        User user = userRepository.findByIdAndStatus(userId, "ROLE_REGISTERED")
                .orElseThrow(() -> new CustomException(UserErrorCode.USER_NOT_FOUND));

        String oldLanguage = user.getLanguage();

        if (userRequestDTO.getNickname() != null) {
            String nickname = validateAndTrimNickname(userRequestDTO.getNickname(), userId);
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
                throw new CustomException(UserErrorCode.INVALID_VALUE);
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

        UserProfileResponseDTO responseDTO = UserProfileResponseDTO.fromSelfEntity(user);

        boolean languageChanged = !oldLanguage.equals(user.getLanguage());
        if (languageChanged) {
            return issueTokens(userId.toString(), user.getLanguage(), "ROLE_REGISTERED", responseDTO);
        }

        return new AuthResult<>(null, null, 0, responseDTO);
    }
}
