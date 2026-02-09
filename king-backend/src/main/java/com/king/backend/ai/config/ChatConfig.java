//package com.king.backend.ai.config;
//
//import org.springframework.ai.openai.OpenAiChatModel;
//import org.springframework.ai.openai.OpenAiChatOptions;
//import org.springframework.ai.openai.api.OpenAiApi;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//
//@Configuration
//public class ChatConfig {
//
//    @Bean
//    public OpenAiChatModel openAiChatModel(
//            @Value("${spring.ai.openai.api-key}") String apiKey,
//            @Value("${spring.ai.openai.chat.options.model}") String model,
//            @Value("${spring.ai.openai.chat.options.temperature}") double temperature) {
//
//        OpenAiChatOptions options = OpenAiChatOptions.builder()
//                .model(model)
//                .temperature(temperature)
//                .build();
//
//        OpenAiApi openAiApi = OpenAiApi.builder()
//                .apiKey(apiKey)
//                .build();
//
//        return OpenAiChatModel.builder().openAiApi(openAiApi).build();
//    }
//}
