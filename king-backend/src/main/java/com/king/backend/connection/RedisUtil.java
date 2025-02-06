package com.king.backend.connection;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class RedisUtil {
    private final RedisTemplate<String, Object> redisTemplate;
    private final ObjectMapper objectMapper;

    public void setValue(String key, String data) {
        ValueOperations<String, Object> values = redisTemplate.opsForValue();
        values.set(key, data);
    }

    public String getValue(String key) {
        ValueOperations<String, Object> values = redisTemplate.opsForValue();
        return (String) values.get(key);
    }

    /**
     * Redis에서 조회수 증가
     */
    public void incrementValue(String key) {
        redisTemplate.opsForValue().increment(key, 1);
    }

    public <T> void setJsonValue(String key, T data) {
        try {
            String jsonData = objectMapper.writeValueAsString(data);
            ValueOperations<String, Object> values = redisTemplate.opsForValue();
            values.set(key, jsonData);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Redis 저장 중 오류 발생", e); // 커스텀
        }
    }

    public <T> T getJsonValue(String key, Class<T> clazz) {
        String jsonData = getValue(key);
        log.info("getJsonValue 실행 시 jsonData값 : {}", jsonData);
        if (jsonData == null) return null;
        try {
            log.info("objectMapper.readValue : {}", objectMapper.readValue(jsonData, clazz));
            return objectMapper.readValue(jsonData, clazz);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Redis 조회 중 오류 발생", e); // 커스텀
        }
    }

    public void deleteValue(String key) {
        redisTemplate.delete(key);
    }
}
