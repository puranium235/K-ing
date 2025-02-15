package com.king.backend.domain.fcm.service;

import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.FirebaseMessagingException;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import com.king.backend.domain.cast.repository.CastRepository;
import com.king.backend.domain.content.repository.ContentRepository;
import com.king.backend.domain.favorite.repository.FavoriteRepository;
import com.king.backend.domain.fcm.entity.FcmToken;
import com.king.backend.domain.fcm.repository.FcmTokenRepository;
import com.king.backend.domain.user.dto.domain.OAuth2UserDTO;
import com.king.backend.domain.user.entity.User;
import com.king.backend.domain.user.errorcode.UserErrorCode;
import com.king.backend.domain.user.repository.UserRepository;
import com.king.backend.global.exception.CustomException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class FcmTokenService {
    private final FcmTokenRepository fcmTokenRepository;
    private final UserRepository userRepository;
    private final FavoriteRepository favoriteRepository;
    private final CastRepository castRepository;
    private final ContentRepository contentRepository;

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
                    FcmToken newToken = new FcmToken();
                    newToken.setUser(user);
                    newToken.setToken(token);
                    fcmTokenRepository.save(newToken);
                });
    }

    public String sendMessageByToken(String token, String title, String body) throws FirebaseMessagingException {
        Message message = Message.builder()
                .setToken(token)
                .setNotification(Notification.builder()
                        .setTitle(title)
                        .setBody(body)
                        .build())
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
