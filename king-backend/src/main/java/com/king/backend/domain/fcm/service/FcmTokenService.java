package com.king.backend.domain.fcm.service;

import com.google.firebase.messaging.*;
import com.king.backend.domain.fcm.entity.FcmToken;
import com.king.backend.domain.fcm.repository.FcmTokenRepository;
import com.king.backend.domain.user.dto.domain.OAuth2UserDTO;
import com.king.backend.domain.user.entity.User;
import com.king.backend.domain.user.errorcode.UserErrorCode;
import com.king.backend.domain.user.repository.UserRepository;
import com.king.backend.global.exception.CustomException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class FcmTokenService {
    @Value("${client.url}")
    private String CLIENT_URL;

    private final FcmTokenRepository fcmTokenRepository;
    private final UserRepository userRepository;

    public void registerToken(String token) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        OAuth2UserDTO oauthUser = (OAuth2UserDTO) authentication.getPrincipal();
        Long userId = Long.parseLong(oauthUser.getName());
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(UserErrorCode.USER_NOT_FOUND));

        fcmTokenRepository.findByUserAndToken(user, token)
                .ifPresentOrElse(existing -> {
                    // 존재하면 업데이트 시각만 변경
                }, () -> {
                    FcmToken newToken = FcmToken.builder()
                            .user(user)
                            .token(token)
                            .build();
                    fcmTokenRepository.save(newToken);
                });
    }

    public String sendMessageByToken(String token, String title, String body, Long postId) throws FirebaseMessagingException {
        String link = CLIENT_URL +"/feed/" + postId;
        log.info(link);
        Message message = Message.builder()
                .setToken(token)
                .setNotification(Notification.builder()
                        .setTitle(title)
                        .setBody(body)
                        .build())
                .setWebpushConfig(
                        WebpushConfig.builder()
                                .setFcmOptions(
                                        WebpushFcmOptions.builder()
                                                .setLink(link)
                                                .build()
                                )
                                .build()
                )
                .build();
        return FirebaseMessaging.getInstance().send(message);
    }

    public void deleteToken(String token) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        OAuth2UserDTO oauthUser = (OAuth2UserDTO) authentication.getPrincipal();
        Long userId = Long.parseLong(oauthUser.getName());
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(UserErrorCode.USER_NOT_FOUND));

        Optional<FcmToken> tokenRecord = fcmTokenRepository.findByUserAndToken(user, token);
        tokenRecord.ifPresent(fcmTokenRepository::delete);
    }
}
