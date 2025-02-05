package com.king.backend.domain.post.repository;

import com.king.backend.domain.post.entity.Like;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LikeRepository extends JpaRepository<Like, Long> {
    Long countByPostId(Long postId);
    boolean existsByPostIdAndUserId(Long postId, Long userId);
}
