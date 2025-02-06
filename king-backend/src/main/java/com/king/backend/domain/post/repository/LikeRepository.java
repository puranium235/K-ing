package com.king.backend.domain.post.repository;

import com.king.backend.domain.post.entity.Like;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LikeRepository extends JpaRepository<Like, Long> {
    Long countByPostId(Long postId);
    boolean existsByPostIdAndUserId(Long postId, Long userId);
    void deleteByPostId(Long postId);
    Optional<Like> findByPostIdAndUserId(Long postId, Long userId);
}
