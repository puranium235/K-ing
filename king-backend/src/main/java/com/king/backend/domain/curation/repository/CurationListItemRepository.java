package com.king.backend.domain.curation.repository;

import com.king.backend.domain.curation.entity.CurationListItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CurationListItemRepository extends JpaRepository<CurationListItem, Long> {
    List<CurationListItem> findByCurationListId(Long curationListId);
}
