package com.king.backend.externaldata.repository;

import com.king.backend.externaldata.entity.Cast;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CastRepository extends JpaRepository<Cast, Long> {
    Optional<Cast> findByName(String name);
    Optional<Cast> findByTmdbId(Integer tmdbId);
}
