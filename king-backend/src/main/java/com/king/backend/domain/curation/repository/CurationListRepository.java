package com.king.backend.domain.curation.repository;

import com.king.backend.domain.curation.entity.CurationList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CurationListRepository extends JpaRepository<CurationList, Long> {
    Optional<CurationList> findById(Long curationListId);
}
