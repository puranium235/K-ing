package com.king.backend.ai.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

@Slf4j
public class AuthUtil {
    public static Long getUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        // 🔍 로그 추가하여 SecurityContext 확인
        if (authentication == null) {
            log.warn("🚨 SecurityContext에 Authentication이 없습니다.");
            throw new RuntimeException("User is not authenticated.");
        }

        //log.info("🔍 인증된 사용자: {}", authentication.getName()); // 로그 추가

        return Long.parseLong(authentication.getName());
    }

}
