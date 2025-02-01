package com.king.backend.domain.curation.repository;

import com.king.backend.domain.curation.entity.CurationListBookmark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CurationListBookmarkRepository extends JpaRepository<CurationListBookmark, Long> {
    boolean existsByCurationListIdAndUserId(Long curationListId, Long userId);
}
