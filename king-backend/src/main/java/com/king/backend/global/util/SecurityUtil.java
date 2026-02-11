package com.king.backend.global.util;

import com.king.backend.domain.user.dto.domain.OAuth2UserDTO;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public class SecurityUtil {

    public static Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return Long.parseLong(authentication.getName());
    }

    public static OAuth2UserDTO getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return (OAuth2UserDTO) authentication.getPrincipal();
    }

    public static String getCurrentLanguage() {
        return getCurrentUser().getLanguage();
    }
}
