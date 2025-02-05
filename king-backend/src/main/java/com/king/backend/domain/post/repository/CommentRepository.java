package com.king.backend.domain.post.repository;

import com.king.backend.domain.post.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    Long countByPostId(@Param("postId") Long postId);
    List<Comment> findByPostId(Long postId);
}