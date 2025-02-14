package com.king.backend.global;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.translate.Translate;
import com.google.cloud.translate.TranslateOptions;
import com.google.cloud.translate.Translation;
import com.king.backend.global.errorcode.TranslateErrorCode;
import com.king.backend.global.exception.CustomException;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;

@Service
public class GoogleTranslateService {
    private static final Translate translate;

    static {
        try {
            InputStream serviceAccountStream = new ClassPathResource("k-ing-448601-233f5fd0a452.json").getInputStream();

            translate = TranslateOptions.newBuilder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccountStream))
                    .build()
                    .getService();
        } catch (IOException e) {
            throw new CustomException(TranslateErrorCode.GOOGLE_CREDENTIAL_FAILED);
        }
    }

    public String translateText(String text, String targetLanguage) {
        return translate.translate(text, Translate.TranslateOption.targetLanguage(targetLanguage)).getTranslatedText();
    }

    public List<String> translateText(List<String> texts, String targetLanguage) {
        return translate.translate(texts, Translate.TranslateOption.targetLanguage(targetLanguage))
                .stream()
                .map(Translation::getTranslatedText)
                .toList();
    }
}
