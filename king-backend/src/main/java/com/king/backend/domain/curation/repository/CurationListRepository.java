package com.king.backend.domain.curation.repository;

import com.king.backend.domain.curation.entity.CurationList;
import com.king.backend.domain.user.entity.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CurationListRepository extends JpaRepository<CurationList, Long> {
    @Query("SELECT c FROM CurationList c JOIN FETCH c.writer")
    List<CurationList> findAllWithWriter();

    List<CurationList> findAllByIsPublicOrderByIdDesc(boolean isPublic, Pageable pageable);
    List<CurationList> findByIsPublicAndIdLessThanOrderByIdDesc(
            boolean isPublic, Long lastId, Pageable pageable);

    List<CurationList> findAllByWriterOrderByIdDesc(User writer, Pageable pageable);
    List<CurationList> findByWriterAndIdLessThanOrderByIdDesc(User writer, long lastId, Pageable pageable);

    List<CurationList> findAllByIsPublicAndWriterOrderByIdDesc(boolean isPublic, User writer, Pageable pageable);
    List<CurationList> findByIsPublicAndWriterAndIdLessThanOrderByIdDesc(boolean isPublic, User writer, long lastId, Pageable pageable);
}
