package com.king.backend.domain.user.util;

public class UserUtil {
    public static boolean isValidNickname(String nickname) {
        return nickname != null && !nickname.trim().isEmpty() && nickname.length() <= 50;
    }

    public static boolean isValidLanguage(String language) {
        return language != null && language.matches("^(ko|en|ja|zh)$");
    }

    public static boolean isValidDescription(String description) {
        return description == null || description.length() <= 150;
    }
}
