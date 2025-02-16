package com.king.backend.domain.fcm.service;

import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.FirebaseMessagingException;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import com.king.backend.domain.curation.entity.CurationList;
import com.king.backend.domain.curation.repository.CurationListRepository;
import com.king.backend.domain.fcm.entity.FcmToken;
import com.king.backend.domain.fcm.repository.FcmTokenRepository;
import com.king.backend.domain.user.dto.domain.OAuth2UserDTO;
import com.king.backend.domain.user.entity.User;
import com.king.backend.domain.user.errorcode.UserErrorCode;
import com.king.backend.domain.user.repository.UserRepository;
import com.king.backend.global.exception.CustomException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class FcmTokenService {
    private final FcmTokenRepository fcmTokenRepository;
    private final UserRepository userRepository;
    private final CurationListRepository curationListRepository;

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

    /**
     * 매일 08:00, 16:00에 가장 최근 큐레이션을 추천
     */
//    @Scheduled(cron = "0 0 8,16 * * *", zone = "Asia/Seoul")
    @Scheduled(fixedRate = 10000)
    public void sendCurationRecommendations() {
        Optional<CurationList> optionalCuration = curationListRepository.findTopByIsPublicTrueOrderByCreatedAtDesc();
        if (optionalCuration.isEmpty()) {
            log.info("큐레이션이 존재하지 않습니다.");
            return;
        }
        CurationList latestCuration = optionalCuration.get();

        String title = "큐레이션 추천";
        String body = "'" + latestCuration.getTitle() + "'" + " 큐레이션을 확인해보세요.";

        List<FcmToken> tokens = fcmTokenRepository.findAll();
        if (tokens.isEmpty()) {
            log.info("전송할 FCM 토큰이 없습니다.");
            return;
        }
        log.info("3초마다 출력 중");

        for (FcmToken tokenEntity : tokens) {
            try {
                String responseId = sendMessageByToken(tokenEntity.getToken(), title, body);
                log.info("토큰 {}: 알림 전송 성공 (메시지 ID: {})", tokenEntity.getToken(), responseId);
            } catch (FirebaseMessagingException e) {
                log.error("토큰 {}: 알림 전송 실패 - {}", tokenEntity.getToken(), e.getMessage());
            }
        }
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
