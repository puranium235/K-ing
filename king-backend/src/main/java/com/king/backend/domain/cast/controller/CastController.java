package com.king.backend.domain.cast.controller;

import com.king.backend.domain.cast.service.CastService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Slf4j
@RequestMapping("/content")
@RequiredArgsConstructor
public class CastController {
    private final CastService castService;
}
