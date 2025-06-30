package com.king.backend.domain.post.repository;

import com.king.backend.domain.post.entity.PostImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PostImageRepository extends JpaRepository<PostImage, Long> {
    Optional<PostImage> findByPostId(Long postId);
}