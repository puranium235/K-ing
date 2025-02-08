package com.king.backend.domain.post.repository;

import com.king.backend.domain.post.entity.Post;
import com.king.backend.domain.user.entity.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findAllByIsPublicOrderByIdDesc(boolean isPublic, Pageable pageable);
    List<Post> findByIsPublicAndIdLessThanOrderByIdDesc(boolean isPublic, Long lastId, Pageable pageable);
    List<Post> findAllByWriterOrderByIdDesc(User user, Pageable pageable);
    List<Post> findByWriterAndIdLessThanOrderByIdDesc(User user, Long lastId, Pageable pageable);
    List<Post> findAllByIsPublicAndWriterOrderByIdDesc(boolean isPublic, User writer, Pageable pageable);
    List<Post> findByIsPublicAndWriterAndIdLessThanOrderByIdDesc(boolean isPublic, User user, Long lastId, Pageable pageable);


    // 최신순으로 limit 개수만큼 가져오기 (커서가 없는 경우)
    List<Post> findByOrderByCreatedAtDesc(Pageable pageable);

    // 커서 기준 이전 데이터를 최신순으로 가져오기
    List<Post> findByCreatedAtBeforeOrderByCreatedAtDesc(OffsetDateTime cursor, Pageable pageable);
}