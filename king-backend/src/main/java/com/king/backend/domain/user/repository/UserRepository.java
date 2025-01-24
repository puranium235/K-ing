package com.king.backend.domain.user.repository;

import com.king.backend.domain.user.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, Long> {
    UserEntity findByGoogleIdAndStatusIn(String googleId, List<String> statuses);
}
