package com.king.backend.domain.place.service;

import lombok.extern.slf4j.Slf4j;
import org.apache.hc.client5.http.config.RequestConfig;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Service
public class GooglePhotoService {
    private final RestTemplate restTemplate;

    @Value("${spring.place.google-api-key}")
    private String API_KEY;

    public GooglePhotoService() {
        CloseableHttpClient httpClient = HttpClients.custom()
                .setDefaultRequestConfig(RequestConfig.custom()
                        .setRedirectsEnabled(false)  // 리디렉션 방지
                        .build())
                .build();

        HttpComponentsClientHttpRequestFactory factory = new HttpComponentsClientHttpRequestFactory(httpClient);

        this.restTemplate = new RestTemplate(factory);
    }

    public String getRedirectedImageUrl(String requestUrl) {
        if (!requestUrl.startsWith("https://map")) {
            return requestUrl;
        }

        String updatedUrl = requestUrl.replaceAll("key=[^&]+", "key=" + API_KEY);

        ResponseEntity<Void> response = restTemplate.getForEntity(updatedUrl, Void.class);

        if (response.getStatusCode().is3xxRedirection()) {
            return response.getHeaders().getLocation().toString();
        }

        return requestUrl;
    }

}
