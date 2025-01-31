package com.king.backend.global.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class S3Config {

    @Value("${AWS_ACCESS_KEY}")
    private String accessKey;

    @Value("${AWS_SECRET_KEY}")
    private String secretKey;

    @Value("${AWS_REGION}")
    private String region;



}
