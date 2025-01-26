package com.king.backend.externaldata.repository;

import com.king.backend.externaldata.entity.ContentCast;
import com.king.backend.externaldata.entity.Cast;
import com.king.backend.externaldata.entity.Content;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ContentCastRepository extends JpaRepository<ContentCast, Long> {
    Optional<ContentCast> findByContentAndCast(Content content, Cast cast);
}
