package com.king.backend.domain.post.repository;

import com.king.backend.domain.post.entity.Like;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface LikeRepository extends JpaRepository<Like, Long> {
    @Query(value = "SELECT COUNT(*) FROM `like` WHERE post_id = :postId", nativeQuery = true)
    int countByPostId(@Param("postId") Long postId);
}
