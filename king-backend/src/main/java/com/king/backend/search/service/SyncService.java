package com.king.backend.search.service;

import com.king.backend.domain.cast.entity.Cast;
import com.king.backend.domain.cast.repository.CastRepository;
import com.king.backend.domain.content.entity.Content;
import com.king.backend.domain.content.repository.ContentRepository;
import com.king.backend.domain.place.entity.Place;
import com.king.backend.domain.place.repository.PlaceRepository;
import com.king.backend.search.entity.SearchDocument;
import com.king.backend.search.repository.SearchRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 데이터 동기화 서비스 (MySQL <-> Elasticsearch)
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SyncService implements CommandLineRunner {

    private final CastRepository castRepository;
    private final ContentRepository contentRepository;
    private final PlaceRepository placeRepository;
    private final SearchRepository searchRepository;

    @Override
    public void run(String... args) throws Exception {
        log.info("초기 mysql-elasticsearch 데이터 마이그레이션 시작");
        log.info("초기 mysql-elasticsearch 데이터 마이그레이션 완료");
    }

    /**
     * Cast 데이터 마이그레이션
     */
    private void migrateCasts(){
        List<Cast> casts = castRepository.findAll();

        List<SearchDocument> documents = casts.stream()
                .map(cast -> new SearchDocument(
                        "CAST-"+cast.getId(),
                        "CAST",
                        cast.getTranslationKo().getName(),
                        "가수, 인물",
                        cast.getImageUrl(),
                        cast.getId()
                ))
                .collect(Collectors.toList());

        searchRepository.saveAll(documents);
        log.info("Cast 데이터 mysql -> elasticsearch 마이그레이션 완료: {} 건", documents.size());
    }

    /**
     * Content 데이터 마이그레이션
     */
    private void migrateContents(){
        List<Content> contents = contentRepository.findAll();
        List<SearchDocument> documents = contents.stream()
                .map(content -> new SearchDocument(
                        "CONTENT-" + content.getId(),
                        content.getType().toLowerCase(),
                        content.getTranslationKo().getTitle(),
                        content.getTranslationKo().getDescription(),
                        content.getImageUrl(),
                        content.getId()
                )).collect(Collectors.toList());
        searchRepository.saveAll(documents);
        log.info("Content 데이터 mysql -> elasticsearch 마이그레이션 완료: {} 건", documents.size());
    }

    /**
     * Place 데이터 마이그레이션
     */
    private void migratePlaces() {
        List<Place> places = placeRepository.findAll();
        List<SearchDocument> documents = places.stream()
                .map(place -> new SearchDocument(
                        "PLACE-" + place.getId(),
                        "PLACE",
                        place.getName(),
                        place.getAddress(),
                        place.getImageUrl(),
                        place.getId()
                ))
                .collect(Collectors.toList());
        searchRepository.saveAll(documents);
        log.info("Place 데이터 mysql -> elasticsearch 마이그레이션 완료: {} 건", documents.size());
    }

    /**
     * MySQL 데이터 변경 시 Elasticsearch 동기화 메소드
     * Content 데이터 저장
     */
    public void indexContent(Content content) {
        SearchDocument doc = new SearchDocument(
                "CONTENT-" + content.getId(),
                content.getType().toUpperCase(),
                content.getTranslationEn().getTitle(),
                content.getTranslationEn().getDescription(),
                content.getImageUrl(),
                content.getId()
        );
        searchRepository.save(doc);
        log.info("Content 인덱싱 완료: {}", doc.getId());
    }

    /**
     * Content 인덱스 업데이트
     */
    public void updateContent(Content content) {
        indexContent(content);
        log.info("Content 업데이트 완료: {}", content.getId());
    }

    /**
     * Content 인덱스 삭제
     */
    public void deleteContent(Long contentId) {
        String documentId = "CONTENT-" + contentId;
        searchRepository.deleteById(documentId);
        log.info("Content 인덱스 삭제 완료: {}", documentId);
    }

    /**
     * Cast 인덱싱 (생성 및 업데이트)
     */
    public void indexCast(Cast cast) {
        SearchDocument doc = new SearchDocument(
                "CAST-" + cast.getId(),
                "CAST",
                cast.getTranslationEn().getName(),
                "가수, 인물", // 실제로는 더 구체적인 정보
                cast.getImageUrl(),
                cast.getId()
        );
        searchRepository.save(doc);
        log.info("Cast 인덱싱 완료: {}", doc.getId());
    }

    /**
     * Cast 인덱스 업데이트
     */
    public void updateCast(Cast cast) {
        indexCast(cast);
        log.info("Cast 업데이트 완료: {}", cast.getId());
    }

    /**
     * Cast 인덱스 삭제
     */
    public void deleteCast(Long castId) {
        String documentId = "CAST-" + castId;
        searchRepository.deleteById(documentId);
        log.info("Cast 인덱스 삭제 완료: {}", documentId);
    }

    /**
     * Place 인덱싱 (생성 및 업데이트)
     */
    public void indexPlace(Place place) {
        SearchDocument doc = new SearchDocument(
                "PLACE-" + place.getId(),
                "PLACE",
                place.getName(),
                place.getAddress(),
                place.getImageUrl(),
                place.getId()
        );
        searchRepository.save(doc);
        log.info("Place 인덱싱 완료: {}", doc.getId());
    }

    /**
     * Place 인덱스 업데이트
     */
    public void updatePlace(Place place) {
        indexPlace(place);
        log.info("Place 업데이트 완료: {}", place.getId());
    }

    /**
     * Place 인덱스 삭제
     */
    public void deletePlace(Long placeId) {
        String documentId = "PLACE-" + placeId;
        searchRepository.deleteById(documentId);
        log.info("Place 인덱스 삭제 완료: {}", documentId);
    }
}
