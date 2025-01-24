package com.king.backend.domain.cast.service;

import com.king.backend.domain.cast.repository.CastRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CastService {
    private final CastRepository castRepository;
}
