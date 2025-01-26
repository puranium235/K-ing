package com.king.backend.externaldata.repository;

import com.king.backend.externaldata.entity.Content;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ContentRepository extends JpaRepository<Content, Long> {
    Optional<Content> findByTitle(String title);

    // 부분 일치 제목을 검색하기 위한 메서드 (필요 시)
    List<Content> findByTitleContainingIgnoreCase(String titlePart);
}
