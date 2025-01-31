package com.king.backend.search.service;

import co.elastic.clients.elasticsearch._types.mapping.*;
import com.king.backend.connection.RedisUtil;
import com.king.backend.domain.cast.entity.Cast;
import com.king.backend.domain.cast.repository.CastRepository;
import com.king.backend.domain.content.entity.Content;
import com.king.backend.domain.content.repository.ContentRepository;
import com.king.backend.domain.place.entity.Place;
import com.king.backend.domain.place.repository.PlaceRepository;
import com.king.backend.search.entity.SearchDocument;
import com.king.backend.search.repository.SearchRepository;
import com.king.backend.search.util.ElasticsearchUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
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
    private final ElasticsearchUtil elasticsearchUtil;
    private final RedisUtil redisUtil;

    private static final String INDEX_NAME = "search-index";

    @Override
    public void run(String... args) throws Exception {
        log.info("초기 mysql-elasticsearch 데이터 마이그레이션 시작");

        // 기존 인덱스가 있는지 확인하고 없으면 생성
        if (elasticsearchUtil.indexExists(INDEX_NAME)) {
            elasticsearchUtil.deleteIndex(INDEX_NAME);
        }

        log.info("인덱스가 존재하지 않음. 새로 생성합니다.");

        // Define properties with new fields
        Map<String, Property> properties = new HashMap<>();
        properties.put("id", new Property.Builder().keyword(new KeywordProperty.Builder().build()).build());
        properties.put("category", new Property.Builder().keyword(new KeywordProperty.Builder().build()).build());
        properties.put("type", new Property.Builder().keyword(new KeywordProperty.Builder().build()).build()); // Added 'type'
        properties.put("name", new Property.Builder().text(new TextProperty.Builder().analyzer("standard").build()).build());
        properties.put("details", new Property.Builder().text(new TextProperty.Builder().analyzer("standard").build()).build());
        properties.put("imageUrl", new Property.Builder().keyword(new KeywordProperty.Builder().build()).build());
        properties.put("originalId", new Property.Builder().long_(new LongNumberProperty.Builder().build()).build());
        properties.put("popularity", new Property.Builder().integer(new IntegerNumberProperty.Builder().build()).build()); // Added 'popularity'
        properties.put("createdAt", new Property.Builder().date(new DateProperty.Builder().format("strict_date_optional_time||epoch_millis").build()).build());
        elasticsearchUtil.createIndex(INDEX_NAME, properties);

        migrateCasts();
        migrateContents();
        migratePlaces();
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
                        "N/A", // 'type' for Cast is not applicable; set as "N/A" or null
                        cast.getTranslationKo().getName(),
                        "가수, 인물",
                        cast.getImageUrl(),
                        cast.getId(),
                        0, // initial popularity, for Cast, could be set to 0 or another default
                        cast.getCreatedAt()
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
                        content.getType().toUpperCase(),
                        content.getType().toUpperCase(), // 'type' field
                        content.getTranslationKo().getTitle(),
                        content.getTranslationKo().getDescription(),
                        content.getImageUrl(),
                        content.getId(),
                        0, // initial popularity
                        content.getCreatedAt()
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
                .map(place -> {
                    String key = "place:view:" + place.getId();
                    String viewCountStr = redisUtil.getValue(key);
                    int viewCount = 0;
                    if(viewCountStr != null) {
                        try{
                            viewCount = Integer.parseInt(viewCountStr);
                        }catch (NumberFormatException e){
                            log.warn("Invalid view count for place {}: {}",place.getId(),viewCountStr);
                        }
                    }

                    return new SearchDocument(
                            "PLACE-" + place.getId(),
                            "PLACE",
                            place.getType().toUpperCase(),
                            place.getName(),
                            place.getAddress(),
                            place.getImageUrl(),
                            place.getId(),
                            viewCount,
                            place.getCreatedAt()
                    );
                })
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
                content.getType().toUpperCase(),
                content.getTranslationEn().getTitle(),
                content.getTranslationEn().getDescription(),
                content.getImageUrl(),
                content.getId(),
                0,
                content.getCreatedAt()
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
                "N/A",
                cast.getTranslationEn().getName(),
                "가수, 인물", // 실제로는 더 구체적인 정보
                cast.getImageUrl(),
                cast.getId(),
                0,
                cast.getCreatedAt()
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
        String key = "place:view:" + place.getId();
        String viewCountStr = redisUtil.getValue(key);
        int viewCount = 0;
        if(viewCountStr != null) {
            try{
                viewCount = Integer.parseInt(viewCountStr);
            }catch (NumberFormatException e){
                log.warn("Invalid view count for place {}: {}",place.getId(),viewCountStr);
            }
        }

        SearchDocument doc = new SearchDocument(
                "PLACE-" + place.getId(),
                "PLACE",
                place.getType().toUpperCase(),
                place.getName(),
                place.getAddress(),
                place.getImageUrl(),
                place.getId(),
                viewCount,
                place.getCreatedAt()
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
