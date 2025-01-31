package com.king.backend.connection;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class RedisUtil {
    private final RedisTemplate<String, Object> redisTemplate;

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
}
