package com.king.backend.domain.curation.repository;

import com.king.backend.domain.curation.entity.CurationList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CurationListRepository extends JpaRepository<CurationList, Long> {
    Optional<CurationList> findById(Long curationListId);

    @Query("SELECT c FROM CurationList c JOIN FETCH c.writer")
    List<CurationList> findAllWithWriter();
}
