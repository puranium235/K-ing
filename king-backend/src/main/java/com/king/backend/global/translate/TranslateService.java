package com.king.backend.global.translate;

import com.king.backend.domain.user.errorcode.UserErrorCode;
import com.king.backend.global.exception.CustomException;
import com.king.backend.global.util.RedisUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class TranslateService {

    private final TranslateUtil translateUtil;
    private final RedisUtil redisUtil;

    public Map<String, String> getTranslatedText(Map<String, String> originalText, String targetLanguage) {
        if (!targetLanguage.matches("^(ko|en|ja|zh)$")) {
            throw new CustomException(UserErrorCode.INVALID_LANGUAGE);
        }

        List<String> keys = new ArrayList<>();
        List<String> values = new ArrayList<>();
        Map<String, String> translatedText = new HashMap<>();

        for (Map.Entry<String, String> entry : originalText.entrySet()) {
            String cached = redisUtil.getValue(entry.getKey());

            if (cached == null) {
                keys.add(entry.getKey());
                values.add(entry.getValue());
                continue;
            }

            translatedText.put(entry.getKey(), cached);
        }

        List<String> translatedValues = translateUtil.translateText(values, targetLanguage);

        for (int i = 0; i < translatedValues.size(); i++) {
            String key = keys.get(i);
            String value = translatedValues.get(i);
            translatedText.put(key, value);
            redisUtil.setValue(key, value, 7, TimeUnit.DAYS);
        }

        return translatedText;
    }
}
