package com.king.backend.connection;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin("*")
@RequiredArgsConstructor
public class ConnectionController {
    private final MessageRepository messageRepository;
    private final LogRepository logRepository;
    private final RedisUtil redisUtil;

    @GetMapping("/mysql-get")
    public List<Message> getAllMessages() {
        return messageRepository.findAll();
    }

    @PostMapping("/mysql-set")
    public Message postMessage(@RequestBody Message message) {
        return messageRepository.save(message);
    }

    @GetMapping("/redis-set")
    public boolean SetRedis(@RequestParam String key, @RequestParam String value) {
        try {
            redisUtil.setValue(key, value);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    @GetMapping("/redis-get")
    public String getRedis(@RequestParam String key) {
        try {
            return redisUtil.getValue(key);
        } catch (Exception e) {
            return "값이 없습니다";
        }
    }

    @GetMapping("/es-get")
    public Iterable<Log> getAllLogs() {
        return logRepository.findAll();
    }
}
